import * as v from "valibot";
import { type Sha256Digest } from "../shared/digests.js";
/** Fixed native declaration vocabulary, never a runtime registration API. */
export declare const RUNTIME_PROBE_SOURCE_VALUES: readonly ["stdout", "stderr", "pty", "structured_output", "tool_progress", "api_progress", "process_lifecycle", "worker_heartbeat", "graph_progress", "frame_progress", "evaluator_progress", "event_log", "ledger", "manifest", "projection", "report", "dossier", "archive", "result_artifact"];
export type RuntimeProbeSource = typeof RUNTIME_PROBE_SOURCE_VALUES[number];
export declare function actorRuntimeProbeSources(parser: "claude_stream_json" | "plain_text"): readonly RuntimeProbeSource[];
export declare const RUNTIME_INVOCATION_DISPOSITION_VALUES: readonly ["continue_waiting", "controlled_terminate", "retry", "yield_continuation", "block", "inspect_archive", "escalate", "reprice_policy"];
export type RuntimeInvocationDispositionKind = typeof RUNTIME_INVOCATION_DISPOSITION_VALUES[number];
export interface RuntimeInvocationScope {
    readonly basisRef: string;
    readonly programRef: string;
    readonly runId: string;
    readonly graphFunctionRef: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly cCallRef: string | null;
    readonly programLocusRef: string | null;
    readonly taskOrdinal: number | null;
    readonly vectorIndex: number | null;
    readonly edgeRef: string | null;
    readonly attempt: number;
    readonly actorInvocationRef: string | null;
    readonly actorRef: string | null;
    readonly workerBindingRef: string | null;
    readonly backendRef: string | null;
}
export interface RuntimeWatchdogPolicy {
    readonly kind: "runtime_watchdog_policy";
    readonly schemaVersion: "5.0.0";
    readonly policyRef: string;
    readonly policyDigest: Sha256Digest;
    readonly startupMs: number;
    readonly inactivityMs: number;
    readonly hardCapMs: number;
    readonly terminationGraceMs: number;
}
export interface RuntimeLivenessBinding {
    readonly kind: "runtime_liveness_binding";
    readonly schemaVersion: "5.0.0";
    readonly clockOriginRef: string;
    readonly clockKind: "native_monotonic_elapsed";
    /** Native non-actor occurrences have no implicit numeric watchdog policy. */
    readonly policy: RuntimeWatchdogPolicy | null;
    readonly sources: readonly RuntimeProbeSource[];
}
export interface RuntimeSystemProbeContract {
    readonly kind: "runtime_system_probe_contract";
    readonly schemaVersion: "5.0.0";
    readonly probeRef: string;
    readonly probeDigest: Sha256Digest;
    readonly scope: RuntimeInvocationScope;
    readonly clockOriginRef: string;
    readonly source: RuntimeProbeSource;
    readonly sourceRef: string;
    readonly declarationEventRef: string;
    readonly required: boolean;
}
export interface RuntimeProbeObservation {
    readonly kind: "runtime_probe_observation";
    readonly schemaVersion: "5.0.0";
    readonly probeRef: string;
    readonly scopeDigest: Sha256Digest;
    readonly clockOriginRef: string;
    readonly elapsedMs: number;
    readonly underlyingObservationRef: string;
    readonly underlyingEventRef: string | null;
    readonly sourceDigest: Sha256Digest;
    readonly sourceRevisionDigest: Sha256Digest | null;
    readonly evidenceRefs: readonly string[];
    readonly coverage: "observed" | "unavailable";
    readonly signal: "coverage" | "activity" | "artifact_pending" | "artifact_admitted" | "artifact_rejected" | "external_interruption";
}
export interface RuntimeThresholdObservation {
    readonly kind: "runtime_threshold_observation";
    readonly schemaVersion: "5.0.0";
    readonly clockOriginRef: string;
    readonly elapsedMs: number;
    readonly policyRef: string;
    readonly scopeDigest: Sha256Digest;
    readonly evaluatedPrefixDigest: Sha256Digest;
    readonly projectionDigest: Sha256Digest;
}
export interface RuntimeInvocationDisposition {
    readonly kind: "runtime_invocation_disposition";
    readonly schemaVersion: "5.0.0";
    readonly disposition: RuntimeInvocationDispositionKind;
    readonly reason: string;
}
export interface RuntimeLivenessObserverProjection {
    readonly kind: "runtime_liveness_observer_projection";
    readonly schemaVersion: "5.0.0";
    readonly projectionRef: string;
    readonly projectionDigest: Sha256Digest;
    readonly scope: RuntimeInvocationScope;
    readonly policyRef: string | null;
    readonly prefixDigest: Sha256Digest;
    readonly retryBudget: Readonly<{
        remaining: number | null;
        retryEligible: boolean;
        continuationRef: string | null;
        terminalPolicy: "block" | "escalate" | "reprice_policy";
        resultRejectionRef: string | null;
    }>;
    readonly asOf: Readonly<{
        clockOriginRef: string;
        elapsedMs: number;
        eventRef: string | null;
    }>;
    readonly coverage: readonly Readonly<{
        probeRef: string;
        source: RuntimeProbeSource;
        state: "observed" | "unknown";
    }>[];
    readonly activeSystems: readonly string[];
    readonly inactiveSystems: readonly string[];
    readonly interruptedSystems: readonly string[];
    readonly lastArtifactObservationRef: string | null;
    readonly evidenceRefs: readonly string[];
    readonly lastActivityElapsedMs: number | null;
    readonly leaseDeadlineElapsedMs: number | null;
    readonly hardDeadlineElapsedMs: number | null;
    readonly leaseExpired: boolean;
    readonly hardCapReached: boolean;
    readonly externallyInterrupted: boolean;
    readonly artifactState: "absent" | "pending" | "admitted" | "rejected";
    readonly disposition: RuntimeInvocationDisposition;
}
export declare function runtimeLivenessDigest(value: unknown): Sha256Digest;
export declare function constructRuntimeWatchdogPolicy(input: Readonly<{
    startupMs: number;
    inactivityMs: number;
    hardCapMs: number;
    terminationGraceMs: number;
}>): RuntimeWatchdogPolicy;
export declare function isRuntimeWatchdogPolicy(value: unknown): value is RuntimeWatchdogPolicy;
export declare function isRuntimeInvocationScope(value: unknown): value is RuntimeInvocationScope;
export declare function isRuntimeLivenessBinding(value: unknown): value is RuntimeLivenessBinding;
export declare function constructRuntimeSystemProbeContract(input: Omit<RuntimeSystemProbeContract, "kind" | "schemaVersion" | "probeRef" | "probeDigest">): RuntimeSystemProbeContract;
export declare function isRuntimeSystemProbeContract(value: unknown): value is RuntimeSystemProbeContract;
export declare function isRuntimeProbeObservation(value: unknown): value is RuntimeProbeObservation;
export declare function isRuntimeThresholdObservation(value: unknown): value is RuntimeThresholdObservation;
/** Closed read carrier; its values are produced by the native prefix relation. */
export declare function isRuntimeLivenessObserverProjection(value: unknown): value is RuntimeLivenessObserverProjection;
export interface RuntimeLivenessReadProjection {
    readonly kind: "native_liveness_read_projection";
    readonly schemaVersion: "5.0.0";
    readonly profileSchedule: Readonly<{
        kind: "root_event_profile_schedule";
        schemaVersion: "5.0.0";
        spans: readonly Readonly<{
            eventContractDigest: Sha256Digest;
            firstOrdinal: number;
            lastOrdinal: number;
        }>[];
        boundaryEventRef: string | null;
        currentEventContractDigest: Sha256Digest;
    }>;
    readonly invocations: readonly RuntimeLivenessObserverProjection[];
}
export declare function isRuntimeLivenessReadProjection(value: unknown): value is RuntimeLivenessReadProjection;
export declare const RUNTIME_INVOCATION_SCOPE_SCHEMA: v.StrictObjectSchema<{
    readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly runId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly graphCallId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly frameId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly cCallRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly programLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly taskOrdinal: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
    readonly vectorIndex: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
    readonly edgeRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly attempt: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
    readonly actorInvocationRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly actorRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly workerBindingRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly backendRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
}, undefined>;
export declare const RUNTIME_LIVENESS_OBSERVER_PROJECTION_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"runtime_liveness_observer_projection", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly projectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    readonly projectionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly scope: v.StrictObjectSchema<{
        readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly runId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly graphCallId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly frameId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly cCallRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly programLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly taskOrdinal: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
        readonly vectorIndex: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
        readonly edgeRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly attempt: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly actorInvocationRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly actorRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly workerBindingRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly backendRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>;
    readonly policyRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    readonly retryBudget: v.StrictObjectSchema<{
        readonly remaining: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
        readonly retryEligible: v.BooleanSchema<undefined>;
        readonly continuationRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly terminalPolicy: v.PicklistSchema<["block", "escalate", "reprice_policy"], undefined>;
        readonly resultRejectionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>;
    readonly asOf: v.StrictObjectSchema<{
        readonly clockOriginRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly elapsedMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        readonly eventRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    }, undefined>;
    readonly coverage: v.ArraySchema<v.StrictObjectSchema<{
        readonly probeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly source: v.PicklistSchema<readonly ["stdout", "stderr", "pty", "structured_output", "tool_progress", "api_progress", "process_lifecycle", "worker_heartbeat", "graph_progress", "frame_progress", "evaluator_progress", "event_log", "ledger", "manifest", "projection", "report", "dossier", "archive", "result_artifact"], undefined>;
        readonly state: v.PicklistSchema<["observed", "unknown"], undefined>;
    }, undefined>, undefined>;
    readonly activeSystems: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly inactiveSystems: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly interruptedSystems: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly lastArtifactObservationRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
    readonly lastActivityElapsedMs: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
    readonly leaseDeadlineElapsedMs: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
    readonly hardDeadlineElapsedMs: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
    readonly leaseExpired: v.BooleanSchema<undefined>;
    readonly hardCapReached: v.BooleanSchema<undefined>;
    readonly externallyInterrupted: v.BooleanSchema<undefined>;
    readonly artifactState: v.PicklistSchema<["absent", "pending", "admitted", "rejected"], undefined>;
    readonly disposition: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"runtime_invocation_disposition", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly disposition: v.PicklistSchema<readonly ["continue_waiting", "controlled_terminate", "retry", "yield_continuation", "block", "inspect_archive", "escalate", "reprice_policy"], undefined>;
        readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
    }, undefined>;
}, undefined>;
export declare const RUNTIME_LIVENESS_READ_PROJECTION_SCHEMA: v.StrictObjectSchema<{
    readonly kind: v.LiteralSchema<"native_liveness_read_projection", undefined>;
    readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
    readonly profileSchedule: v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"root_event_profile_schedule", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly spans: v.ArraySchema<v.StrictObjectSchema<{
            readonly eventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
            readonly firstOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly lastOrdinal: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
        }, undefined>, undefined>;
        readonly boundaryEventRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly currentEventContractDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
    }, undefined>;
    readonly invocations: v.ArraySchema<v.StrictObjectSchema<{
        readonly kind: v.LiteralSchema<"runtime_liveness_observer_projection", undefined>;
        readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
        readonly projectionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        readonly projectionDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly scope: v.StrictObjectSchema<{
            readonly basisRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly programRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly runId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly graphFunctionRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly graphCallId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly frameId: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly cCallRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly programLocusRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly taskOrdinal: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
            readonly vectorIndex: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
            readonly edgeRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly attempt: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly actorInvocationRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly actorRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly workerBindingRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly backendRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>;
        readonly policyRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly prefixDigest: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.RegexAction<string, undefined>]>;
        readonly retryBudget: v.StrictObjectSchema<{
            readonly remaining: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.IntegerAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
            readonly retryEligible: v.BooleanSchema<undefined>;
            readonly continuationRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
            readonly terminalPolicy: v.PicklistSchema<["block", "escalate", "reprice_policy"], undefined>;
            readonly resultRejectionRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>;
        readonly asOf: v.StrictObjectSchema<{
            readonly clockOriginRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly elapsedMs: v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>;
            readonly eventRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        }, undefined>;
        readonly coverage: v.ArraySchema<v.StrictObjectSchema<{
            readonly probeRef: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
            readonly source: v.PicklistSchema<readonly ["stdout", "stderr", "pty", "structured_output", "tool_progress", "api_progress", "process_lifecycle", "worker_heartbeat", "graph_progress", "frame_progress", "evaluator_progress", "event_log", "ledger", "manifest", "projection", "report", "dossier", "archive", "result_artifact"], undefined>;
            readonly state: v.PicklistSchema<["observed", "unknown"], undefined>;
        }, undefined>, undefined>;
        readonly activeSystems: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly inactiveSystems: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly interruptedSystems: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly lastArtifactObservationRef: v.NullableSchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly evidenceRefs: v.ArraySchema<v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>, undefined>;
        readonly lastActivityElapsedMs: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
        readonly leaseDeadlineElapsedMs: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
        readonly hardDeadlineElapsedMs: v.NullableSchema<v.SchemaWithPipe<readonly [v.NumberSchema<undefined>, v.FiniteAction<number, undefined>, v.MinValueAction<number, 0, undefined>]>, undefined>;
        readonly leaseExpired: v.BooleanSchema<undefined>;
        readonly hardCapReached: v.BooleanSchema<undefined>;
        readonly externallyInterrupted: v.BooleanSchema<undefined>;
        readonly artifactState: v.PicklistSchema<["absent", "pending", "admitted", "rejected"], undefined>;
        readonly disposition: v.StrictObjectSchema<{
            readonly kind: v.LiteralSchema<"runtime_invocation_disposition", undefined>;
            readonly schemaVersion: v.LiteralSchema<"5.0.0", undefined>;
            readonly disposition: v.PicklistSchema<readonly ["continue_waiting", "controlled_terminate", "retry", "yield_continuation", "block", "inspect_archive", "escalate", "reprice_policy"], undefined>;
            readonly reason: v.SchemaWithPipe<readonly [v.StringSchema<undefined>, v.MinLengthAction<string, 1, undefined>]>;
        }, undefined>;
    }, undefined>, undefined>;
}, undefined>;
