// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-RUN
// Implements: REQ-R-ABG3-CONVERGENCE

import type {
  Graph,
  GraphFunction,
  SerializedAttrs
} from "../../../gtl/m01/contracts/carriers.js";
import type { Job } from "../../../gtl/m02/contracts/carriers.js";

export type RuntimeRegime = "F_D" | "F_P" | "F_H";

export const FD_AUTHORITY_SEVERITY_CLASS_VALUES = Object.freeze([
  "protocol_invalid",
  "construction_context_invalid",
  "diagnostic_shape_invalid",
  "content_unproven"
] as const);

export type FdAuthoritySeverityClass =
  (typeof FD_AUTHORITY_SEVERITY_CLASS_VALUES)[number];

export const FD_PRESSURE_ROUTING_DECISION_VALUES = Object.freeze([
  "continue",
  "block",
  "preserve_pressure",
  "route_to_fp"
] as const);

export type FdPressureRoutingDecision =
  (typeof FD_PRESSURE_ROUTING_DECISION_VALUES)[number];

export const OBSERVED_STATE_SOURCE_KIND_VALUES = Object.freeze([
  "workspace_file",
  "register_json",
  "derived_projection",
  "event_spine_watermark",
  "policy_config"
] as const);

export type ObservedStateSourceKind =
  (typeof OBSERVED_STATE_SOURCE_KIND_VALUES)[number];

export interface ObservedStateSourceRef {
  readonly kind: ObservedStateSourceKind;
  readonly scopeRef: string;
  readonly sourceRef: string;
}

export interface ObservedStateDerivationBasis {
  readonly derivationBasisRef: string;
  readonly basisProjectionRef: string;
  readonly eventWatermark: number;
  readonly derivedFromRefs: readonly string[];
}

export interface ObservedStateRecord {
  readonly kind: "observed_state_record";
  readonly observedStateRef: string;
  readonly source: ObservedStateSourceRef;
  readonly digest: string;
  readonly version: string | null;
  readonly freshnessPolicyRef: string;
  readonly derivationBasis: ObservedStateDerivationBasis;
}

export interface ObservedStateProjection {
  readonly kind: "observed_state_projection";
  readonly projectionRef: string;
  readonly records: readonly ObservedStateRecord[];
  readonly observedStateRefs: readonly string[];
  readonly latestEventWatermark: number;
}

export interface ObservedStateAdmissionOutcome {
  readonly kind: "observed_state_admission_outcome";
  readonly status: "admitted" | "rejected";
  readonly record: ObservedStateRecord;
  readonly diagnosticRefs: readonly string[];
}

export const OVERLAY_FRAME_SCOPE_KIND_VALUES = Object.freeze([
  "graph_function",
  "graph_vector",
  "graph_span",
  "job",
  "module",
  "rule"
] as const);

export type OverlayFrameScopeKind =
  (typeof OVERLAY_FRAME_SCOPE_KIND_VALUES)[number];

export const OVERLAY_FRAME_PREDICATE_ROLE_VALUES = Object.freeze([
  "fire_when",
  "terminate_when"
] as const);

export type OverlayFramePredicateRole =
  (typeof OVERLAY_FRAME_PREDICATE_ROLE_VALUES)[number];

export const OVERLAY_FRAME_PRESSURE_DECISION_VALUES = Object.freeze([
  "carry_pressure",
  "clear_pressure",
  "no_close"
] as const);

export type OverlayFramePressureDecisionKind =
  (typeof OVERLAY_FRAME_PRESSURE_DECISION_VALUES)[number];

export const OVERLAY_FRAME_STATUS_VALUES = Object.freeze([
  "declared",
  "waiting",
  "active",
  "closed",
  "no_close"
] as const);

export type OverlayFrameStatus =
  (typeof OVERLAY_FRAME_STATUS_VALUES)[number];

export interface OverlayFrameScopeEventRow {
  readonly scopeKind: OverlayFrameScopeKind;
  readonly scopeRef: string;
  readonly anchorRef: string;
  readonly vectorIndex: number | null;
  readonly spanId: string | null;
}

export interface OverlayFramePredicateEventRow {
  readonly predicateRef: string;
  readonly role: OverlayFramePredicateRole;
  readonly expressionRef: string;
  readonly observedStateRefs: readonly string[];
}

export interface OverlayFramePredicateEvaluationEventRow {
  readonly predicateRef: string;
  readonly role: OverlayFramePredicateRole;
  readonly satisfied: boolean;
  readonly observedStateRefs: readonly string[];
  readonly missingObservedStateRefs: readonly string[];
}

export interface OverlayFrameContract {
  readonly kind: "overlay_frame_contract";
  readonly overlayFrameRef: string;
  readonly contractRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly scopeRefs: readonly OverlayFrameScopeEventRow[];
  readonly fireWhen: OverlayFramePredicateEventRow;
  readonly terminateWhen: OverlayFramePredicateEventRow;
  readonly pressureRefs: readonly string[];
  readonly foldbackTargetRef: string | null;
  readonly reentryTargetVectorIndex: number | null;
  readonly noClosePolicyRef: string | null;
}

export interface OverlayFrameFoldbackOutcome {
  readonly kind: "overlay_frame_foldback_outcome";
  readonly outcomeRef: string;
  readonly overlayFrameRef: string;
  readonly contractRef: string;
  readonly fireSatisfied: boolean;
  readonly terminateSatisfied: boolean;
  readonly predicateEvaluations: readonly OverlayFramePredicateEvaluationEventRow[];
  readonly pressureDecision: OverlayFramePressureDecisionKind;
  readonly pressureRefs: readonly string[];
  readonly carriedPressureRefs: readonly string[];
  readonly clearedPressureRefs: readonly string[];
  readonly clearingEvidenceRefs: readonly string[];
  readonly foldbackTargetRef: string | null;
  readonly reentryTargetVectorIndex: number | null;
  readonly diagnosticRefs: readonly string[];
}

export interface OverlayFrameProjectionRow {
  readonly kind: "overlay_frame_projection_row";
  readonly overlayFrameRef: string;
  readonly contractRef: string;
  readonly status: OverlayFrameStatus;
  readonly scopeRefs: readonly OverlayFrameScopeEventRow[];
  readonly fireWhen: OverlayFramePredicateEventRow;
  readonly terminateWhen: OverlayFramePredicateEventRow;
  readonly pressureRefs: readonly string[];
  readonly carriedPressureRefs: readonly string[];
  readonly clearedPressureRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
  readonly foldbackTargetRef: string | null;
  readonly reentryTargetVectorIndex: number | null;
  readonly latestOutcomeRef: string | null;
}

export interface OverlayFrameProjection {
  readonly kind: "overlay_frame_projection";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly projectionRef: string;
  readonly rows: readonly OverlayFrameProjectionRow[];
  readonly activeRows: readonly OverlayFrameProjectionRow[];
  readonly activeOverlayFrameRefs: readonly string[];
  readonly carriedPressureRefs: readonly string[];
  readonly clearedPressureRefs: readonly string[];
}

export type EffectiveVectorRegimeSource =
  | "graph_vector_declaration"
  | "graph_vector_runtime_surface"
  | "basis_default_policy";

export interface EffectiveVectorRegime {
  readonly kind: "effective_vector_regime";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly regime: RuntimeRegime;
  readonly source: EffectiveVectorRegimeSource;
  readonly sourceRef: string;
  readonly declarationKey: string | null;
  readonly declaredVectorRegimes: readonly RuntimeRegime[];
  readonly diagnosticRefs: readonly string[];
}

export type PluginTraversalKind = "transform" | "evaluate" | "consequence";

export type PluginTraversalObserverBindingSource =
  | "graph_vector_declarations"
  | "graph_function_declarations"
  | "role_policy_hooks"
  | "abg_defaults";

export interface AbgFallbackBundleRef {
  readonly bundleRef: string;
  readonly bundlePath: string | null;
  readonly bundleDigest: string;
}

export const COMPUTE_BASIS_FAILURE_CLASS_VALUES = Object.freeze([
  "no_compute_basis"
] as const);

export type ComputeBasisFailureClass =
  (typeof COMPUTE_BASIS_FAILURE_CLASS_VALUES)[number];

export const RUNTIME_FAILURE_CLASS_VALUES = Object.freeze([
  "transport_failure",
  "no_output",
  "contract_failure",
  "runtime_unavailable",
  "capability_missing",
  "runtime_failure",
  "payload_contract_failure"
] as const);

export type RuntimeFailureClass =
  (typeof RUNTIME_FAILURE_CLASS_VALUES)[number];

export const BRANCH_EXECUTION_DISPOSITION_VALUES = Object.freeze([
  "block",
  "compensate",
  "escalate",
  "await_human",
  "reenter"
] as const);

export type BranchExecutionDisposition =
  (typeof BRANCH_EXECUTION_DISPOSITION_VALUES)[number];

export const TERMINAL_KIND_VALUES = Object.freeze([
  "converged",
  "nothing_to_do",
  "gap_stop",
  "yielded",
  "dispatch_required",
  "human_gate_required",
  "traversal_applied"
] as const);

export type StartUntil = "first_traversal" | "blocked" | "converged";

export interface StartInputAssetBinding {
  readonly assetRef: string;
  readonly assetType: string;
  readonly uri: string;
}

export interface StartOutputWorkspaceBinding {
  readonly workspaceRef: string;
  readonly workspaceRoot: string;
  readonly authorityRef: string | null;
}

export interface StartRequestedOutput {
  readonly outputName: string;
  readonly outputAssetType: string;
  readonly relativePath: string;
  readonly outputWorkspace?: StartOutputWorkspaceBinding;
}

export interface StartRuntimeTraversalStrategySelectionBatch {
  readonly targetItemCount?: number;
  readonly maxItemCount?: number;
  readonly maxTokenPressure?: number;
}

export interface StartRuntimeTraversalStrategySelectionContinuation {
  readonly sameEdgeUntil?: "foldback_closed" | "retry_budget_exhausted";
  readonly maxAttemptsWithoutNewSignal?: number;
  readonly maxTotalAttempts?: number;
}

export interface StartRuntimeTraversalStrategySelection {
  readonly kind: "start_runtime_traversal_strategy_selection";
  readonly selectionRef: string;
  readonly strategyOwnerRef: string;
  readonly strategyLabel: string;
  readonly enforcementPrimitives: readonly string[];
  readonly selectedScheduleItemRefs: readonly string[];
  readonly requiredProgressArtifactRefs?: readonly string[];
  readonly orderingConstraintRefs?: readonly string[];
  readonly phaseGateRefs?: readonly string[];
  readonly basisRefs?: readonly string[];
  readonly vectorIndexes?: readonly number[];
  readonly edgeRefs?: readonly string[];
  readonly batch?: StartRuntimeTraversalStrategySelectionBatch;
  readonly continuation?: StartRuntimeTraversalStrategySelectionContinuation;
}

export interface StartIntent {
  readonly scope: {
    readonly kind: "workspace";
    readonly workspaceRoot: string;
    readonly moduleName: string;
  };
  readonly target: {
    readonly kind: "graph_function";
    readonly handle: string;
  };
  readonly until: StartUntil;
  readonly inputBindings?: readonly StartInputAssetBinding[];
  readonly requestedOutputs?: readonly StartRequestedOutput[];
  readonly runtimeTraversalSelections?: readonly StartRuntimeTraversalStrategySelection[];
}

export interface ExecutionBasis {
  readonly id: string;
  readonly workspaceRoot: string;
  readonly moduleName: string;
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly job: Job;
  readonly modulePolicyHooks: SerializedAttrs;
  readonly runtimeIdentity: {
    readonly workerId: string;
    readonly backendId: string;
    readonly buildId: string;
    readonly resolvedRuntimeRef: string;
  };
  readonly resolvedPolicy: {
    readonly resolvedPolicyBundleRef: string;
    readonly defaultRegime: RuntimeRegime;
    readonly dispatchRef: string | null;
    readonly approvalSubjectRef: string | null;
  };
  readonly startIntent: StartIntent;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frameId: string | null;
  readonly frameLineageId: string | null;
}

export type TerminalKind =
  (typeof TERMINAL_KIND_VALUES)[number];

export interface FdAdvanceTransition {
  readonly kind: "fd_advance";
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly effectiveRegime: EffectiveVectorRegime;
  readonly status: "ready";
}

export interface FpDispatchTransition {
  readonly kind: "fp_dispatch";
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly effectiveRegime: EffectiveVectorRegime;
  readonly dispatchRef: string;
}

export interface ActorInvocation {
  readonly kind: "actor_invocation";
  readonly actorInvocationId: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly attemptIndex: number;
  readonly dispatchRef: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly resultRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface ActorInvocationRef {
  readonly actorInvocationId: string;
  readonly attemptIndex: number;
  readonly dispatchRef: string;
  readonly resultRef: string;
}

export interface ActorRuntimeScope {
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly actorInvocationId: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface FhEscalationTransition {
  readonly kind: "fh_escalation";
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly effectiveRegime: EffectiveVectorRegime;
  readonly approvalSubjectRef: string;
  readonly gateReason: string;
}

export interface TerminalTransition {
  readonly kind: "terminal";
  readonly basis: ExecutionBasis;
  readonly terminalKind: TerminalKind;
  readonly reason: string | null;
}

export type AdvancementTransition =
  | FdAdvanceTransition
  | FpDispatchTransition
  | FhEscalationTransition
  | TerminalTransition;

export interface BasisAdmittedEvent {
  readonly kind: "basis_admitted";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly jobId: string;
  readonly resolvedRuntimeRef: string;
  readonly resolvedPolicyBundleRef: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export type LeverOverrideResolutionSource =
  | "request"
  | "override"
  | "registry_default";

export interface LeverResolutionAdmittedEvent {
  readonly kind: "lever_resolution_admitted";
  readonly workspaceRoot: string;
  readonly moduleName: string;
  readonly targetHandle: string;
  readonly until: StartUntil;
  readonly fhMode: "direct" | "human-proxy";
  readonly rootMode: "direct" | "supervised";
  readonly resolvedRuntimeRef: string;
  readonly resolvedPolicyBundleRef: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly resolutionRef: string;
  readonly bundleRef: string | null;
  readonly bundleDigest: string | null;
  readonly bundlePath: string | null;
  readonly untilLeverKey: string;
  readonly untilSource: LeverOverrideResolutionSource;
  readonly fhModeLeverKey: string;
  readonly fhModeSource: LeverOverrideResolutionSource;
  readonly runnerRetryMaxAttempts?: number | undefined;
  readonly runnerRetryMaxAttemptsLeverKey?: string | undefined;
  readonly runnerRetryMaxAttemptsSource?: LeverOverrideResolutionSource | undefined;
  readonly selectedLeverKeys: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface FdAdvanceReadyEvent {
  readonly kind: "fd_advance_ready";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly status: "ready";
}

export interface FpDispatchRequestedEvent {
  readonly kind: "fp_dispatch_requested";
  readonly basisId: string;
  readonly dispatchRef: string;
}

export interface ActorInvocationStartedEvent extends ActorRuntimeScope {
  readonly kind: "actor_invocation_started";
  readonly attemptIndex: number;
  readonly dispatchRef: string;
  readonly resultRef: string;
}

export interface ActorResultArtifactObservedEvent extends ActorRuntimeScope {
  readonly kind: "actor_result_artifact_observed";
  readonly resultRef: string;
  readonly artifactRef: string;
  readonly artifactContentDigest: string | null;
  readonly artifactContentExcerpt: string | null;
}

export interface ActorInvocationClosedEvent extends ActorRuntimeScope {
  readonly kind: "actor_invocation_closed";
  readonly closureStatus: "completed" | "blocked" | "blocked_with_artifact";
  readonly resultRef: string | null;
  readonly detail: string | null;
}

export type ActorProcessRuntimeScope = ActorRuntimeScope;

export type ActorProcessStartFailureKind =
  | "executor_unavailable"
  | "launch_failed"
  | "process_error";

export interface ActorProcessStartedEvent extends ActorProcessRuntimeScope {
  readonly kind: "actor_process_started";
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly pid: number | null;
  readonly terminalSessionId: string | null;
  readonly timeoutMs: number;
  readonly stdoutRef: string;
  readonly stderrRef: string;
}

export interface ActorProcessStartFailedEvent extends ActorProcessRuntimeScope {
  readonly kind: "actor_process_start_failed";
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly timeoutMs: number;
  readonly stdoutRef: string;
  readonly stderrRef: string;
  readonly terminalSessionId: string | null;
  readonly failureKind: ActorProcessStartFailureKind;
  readonly detail: string;
}

export interface ActorProcessStreamObservedEvent extends ActorProcessRuntimeScope {
  readonly kind: "actor_process_stream_observed";
  readonly streamName: "stdout" | "stderr";
  readonly streamRef: string;
  readonly chunkIndex: number;
  readonly byteLength: number;
}

export interface ActorProcessHeartbeatEvent extends ActorProcessRuntimeScope {
  readonly kind: "actor_process_heartbeat";
  readonly heartbeatIndex: number;
  readonly elapsedMs: number;
}

export interface ActorProcessTimeoutEvent extends ActorProcessRuntimeScope {
  readonly kind: "actor_process_timeout";
  readonly timeoutMs: number;
  readonly elapsedMs: number;
}

export interface ActorProcessSignalSentEvent extends ActorProcessRuntimeScope {
  readonly kind: "actor_process_signal_sent";
  readonly signal: "SIGTERM" | "SIGKILL";
  readonly elapsedMs: number;
}

export interface ActorProcessExitedEvent extends ActorProcessRuntimeScope {
  readonly kind: "actor_process_exited";
  readonly status: number | null;
  readonly signal: string | null;
  readonly elapsedMs: number;
  readonly timedOut: boolean;
  readonly error: string | null;
}

export const RUNTIME_ACTIVITY_PROBE_SOURCE_VALUES = Object.freeze([
  "local_spawn_stdout",
  "local_spawn_stderr",
  "pty_transcript",
  "structured_agent_stream",
  "api_retry",
  "tool_call",
  "actor_process_lifecycle",
  "actor_process_heartbeat",
  "runtime_event_append",
  "runtime_ledger_write",
  "runtime_manifest_write",
  "runtime_projection_write",
  "archive_write",
  "graph_call_frame",
  "result_artifact",
  "evaluator_fold",
  "scheduler_status"
] as const);

export type RuntimeActivityProbeSource =
  (typeof RUNTIME_ACTIVITY_PROBE_SOURCE_VALUES)[number];

export const RUNTIME_EXTERNAL_INTERRUPTION_SOURCE_VALUES = Object.freeze([
  "host_signal",
  "harness_safety_cap",
  "operator_abort",
  "executor_provider",
  "os_signal",
  "unknown"
] as const);

export type RuntimeExternalInterruptionSource =
  (typeof RUNTIME_EXTERNAL_INTERRUPTION_SOURCE_VALUES)[number];

export interface RuntimeActivityProbeObservedEvent {
  readonly kind: "runtime_activity_probe_observed";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly actorInvocationId: string | null;
  readonly workerId: string | null;
  readonly backendId: string | null;
  readonly systemRef: string;
  readonly probeRef: string;
  readonly probeSource: RuntimeActivityProbeSource;
  readonly activityRef: string;
  readonly elapsedMs: number;
  readonly observedAtMs: number;
  readonly evidenceRefs: readonly string[];
  readonly detail: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface RuntimeExternalInterruptionObservedEvent {
  readonly kind: "runtime_external_interruption_observed";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly actorInvocationId: string | null;
  readonly workerId: string | null;
  readonly backendId: string | null;
  readonly systemRef: string;
  readonly interruptionRef: string;
  readonly interruptionSource: RuntimeExternalInterruptionSource;
  readonly signal: string | null;
  readonly elapsedMs: number;
  readonly observedAtMs: number;
  readonly evidenceRefs: readonly string[];
  readonly detail: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface PluginTraversalPromptMaterializedEvent {
  readonly kind: "plugin_traversal_prompt_materialized";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly traversalKind: PluginTraversalKind;
  readonly materializationRef: string;
  readonly selectionRef: string;
  readonly selectionSource: PluginTraversalObserverBindingSource;
  readonly sourceRef: string;
  readonly attrKey: string | null;
  readonly hookRef: string;
  readonly actorInvocationId: string | null;
  readonly workerId: string | null;
  readonly backendId: string | null;
  readonly observerPromptRef: string;
  readonly renderedPromptRef: string;
  readonly promptInputDigest: string;
  readonly promptTemplateRef: string;
  readonly promptInputContractRef: string;
  readonly expectedOutputContractRef: string;
  readonly progressSignalRefs: readonly string[];
  readonly continuationRequestRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly configDigest: string;
  readonly defaultsBundleRef: string | null;
  readonly defaultsBundleDigest: string | null;
  readonly defaultsPath: string | null;
  readonly defaultKey: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface InstructionCausalContextBoundEvent {
  readonly kind: "instruction_causal_context_bound";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly actorInvocationId: string | null;
  readonly contextRef: string;
  readonly status: "empty" | "bound" | "blocked";
  readonly bindingRefs: readonly string[];
  readonly bindingPolicyRefs: readonly string[];
  readonly contentModes: readonly string[];
  readonly contentRefs: readonly string[];
  readonly contentDigests: readonly string[];
  readonly contentExcerpts: readonly string[];
  readonly payloadRefs: readonly string[];
  readonly payloadDigests: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly requiredInputRefs: readonly string[];
  readonly missingInputRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface FhEscalatedEvent {
  readonly kind: "fh_escalated";
  readonly basisId: string;
  readonly approvalSubjectRef: string;
  readonly gateReason: string;
}

export interface TerminalReachedEvent {
  readonly kind: "terminal_reached";
  readonly basisId: string;
  readonly terminalKind: TerminalKind;
  readonly reason: string | null;
}

export interface GraphCallOpenedEvent {
  readonly kind: "graph_call_opened";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly graphFunctionId: string;
  readonly jobId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export interface FrameOpenedEvent {
  readonly kind: "frame_opened";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly vectorCount: number;
}

export interface VectorTraversalPlannedEvent {
  readonly kind: "vector_traversal_planned";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly regime: RuntimeRegime;
  readonly regimeSource: EffectiveVectorRegimeSource;
  readonly regimeSourceRef: string;
  readonly regimeDiagnosticRefs: readonly string[];
}

export interface VectorEvaluatedEvent {
  readonly kind: "vector_evaluated";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly evaluatorIds: readonly string[];
  readonly status: "accepted" | "blocked";
}

export interface VectorClosedEvent {
  readonly kind: "vector_closed";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly closureKind: "advanced" | "assessed";
}

export interface GraphVectorResumeCursorAppliedEvent {
  readonly kind: "graph_vector_resume_cursor_applied";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly targetVectorIndex: number;
  readonly targetEdge: string;
  readonly resumeCursorRef: string;
  readonly reason: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface RetryAttemptIdentity {
  readonly runId: string;
  readonly callId: string;
  readonly manifestId: string;
  readonly attemptIndex: number;
}

export interface RetryBudgetState {
  readonly observedAttemptCount: number;
  readonly maxAttempts: number;
  readonly remainingAttempts: number;
  readonly stationary: boolean;
}

export interface PromptRegenerationInput {
  readonly workspaceRoot: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly sourceProjectionRef: string;
}

export interface ManifestRegenerationRef {
  readonly priorManifestId: string;
  readonly currentManifestId: string;
  readonly sourceProjectionRef: string;
}

export interface ContinuationRepairLink {
  readonly terminatedContinuationId: string;
  readonly reopenedContinuationId: string;
}

export interface RetryRepairPlannedDecision {
  readonly kind: "retry_planned";
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly attempt: RetryAttemptIdentity;
  readonly budget: RetryBudgetState;
  readonly promptRegeneration: PromptRegenerationInput;
  readonly manifestRegeneration: ManifestRegenerationRef;
  readonly continuationRepair: ContinuationRepairLink | null;
}

export interface RetryRepairStoppedDecision {
  readonly kind: "retry_stopped";
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly budget: RetryBudgetState;
  readonly reason: "retry_budget_exhausted" | "stationary_retry";
}

export interface RetryRepairEscalatedDecision {
  readonly kind: "retry_escalated";
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly budget: RetryBudgetState;
  readonly approvalSubjectRef: string;
  readonly gateReason: "retry_budget_exhausted" | "stationary_retry";
}

export type RetryRepairDecision =
  | RetryRepairPlannedDecision
  | RetryRepairStoppedDecision
  | RetryRepairEscalatedDecision;

export interface RetryRepairPlannedEvent {
  readonly kind: "retry_repair_planned";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly retryRunId: string;
  readonly retryCallId: string;
  readonly manifestId: string;
  readonly priorManifestId: string;
  readonly sourceProjectionRef: string;
  readonly attemptIndex: number;
  readonly maxAttempts: number;
}

export interface RetryAttemptOpenedEvent {
  readonly kind: "retry_attempt_opened";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly retryRunId: string;
  readonly retryCallId: string;
  readonly manifestId: string;
}

export interface RetryAttemptStoppedEvent {
  readonly kind: "retry_attempt_stopped";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly reason: "retry_budget_exhausted" | "stationary_retry";
  readonly observedAttemptCount: number;
  readonly maxAttempts: number;
}

export interface RetryAttemptEscalatedEvent {
  readonly kind: "retry_attempt_escalated";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly approvalSubjectRef: string;
  readonly gateReason: "retry_budget_exhausted" | "stationary_retry";
  readonly observedAttemptCount: number;
  readonly maxAttempts: number;
}

export interface RetryProgressRecordedEvent {
  readonly kind: "retry_progress_recorded";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly retryRunId: string;
  readonly progressSignalRefs: readonly string[];
  readonly stationary: boolean;
}

export interface ContinuationTerminatedEvent {
  readonly kind: "continuation_terminated";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly continuationId: string;
  readonly causedByRetryRunId: string;
  readonly reason: "retry_repair";
}

export interface ContinuationReopenedEvent {
  readonly kind: "continuation_reopened";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly continuationId: string;
  readonly closedContinuationId: string;
  readonly causedByRetryRunId: string;
}

export interface ParentRuntimeIdentity {
  readonly basisId: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
}

export interface LeafTaskEnvelope {
  readonly kind: "leaf_task_envelope";
  readonly leafTaskId: string;
  readonly parent: ParentRuntimeIdentity;
  readonly inputSchemaRef: string;
  readonly outputSchemaRef: string;
  readonly input: AdmittedLeafTaskPayload;
  readonly workerRef: string;
}

export interface LeafTaskFailure {
  readonly failureClass: RuntimeFailureClass;
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
}

export interface LeafTaskOpenedEvent {
  readonly kind: "leaf_task_opened";
  readonly basisId: string;
  readonly leafTaskId: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly inputSchemaRef: string;
  readonly outputSchemaRef: string;
  readonly workerRef: string;
}

export interface LeafTaskCompletedEvent {
  readonly kind: "leaf_task_completed";
  readonly basisId: string;
  readonly leafTaskId: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly outputSchemaRef: string;
  readonly resultRef: string;
  readonly outputPayloadRef: string;
}

export interface LeafTaskFailedEvent {
  readonly kind: "leaf_task_failed";
  readonly basisId: string;
  readonly leafTaskId: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly failureClass: RuntimeFailureClass;
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
}

export interface ApprovedRuntimeEvent {
  readonly kind: "approved";
  readonly approvalKind: "fh_review" | "fh_intent";
  readonly edge: string;
  readonly actor: "human" | "human-proxy";
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export interface RevokedRuntimeEvent {
  readonly kind: "revoked";
  readonly approvalKind: "fh_approval";
  readonly edge: string;
  readonly actor: string;
  readonly reason: string;
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export interface ResetRuntimeEvent {
  readonly kind: "reset";
  readonly scope: "workspace" | "work_key" | "edge";
  readonly actor: string;
  readonly reason: string;
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly edge: string | null;
}

export interface AssessedRuntimeEvent {
  readonly kind: "assessed";
  readonly assessmentKind: "fp";
  readonly edge: string;
  readonly obligationId: string;
  readonly publishedLedgerRef: string;
  readonly actor: string;
  readonly specHash: string;
  readonly manifestId: string;
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly selectedWorkerId: string | null;
  readonly selectedBackend: string | null;
  readonly roleId: string | null;
  readonly authorityRef: string | null;
  readonly assignmentSource: string | null;
  readonly resolvedRuntimeRef: string | null;
}

export const PAYLOAD_REJECTION_CLASS_VALUES = Object.freeze([
  "missing",
  "empty",
  "malformed",
  "unreadable",
  "schema_invalid",
  "contract_invalid",
  "stale",
  "orphaned",
  "contradictory"
] as const);

export type PayloadRejectionClass =
  (typeof PAYLOAD_REJECTION_CLASS_VALUES)[number];

export const PAYLOAD_AMBIGUITY_STATUS_VALUES = Object.freeze([
  "fulfilled",
  "partial",
  "missing",
  "stale_input",
  "authority_missing",
  "orphan_evidence",
  "contradictory_authority",
  "contradictory_evidence",
  "deferred",
  "event_ledger_invalid"
] as const);

export type PayloadAmbiguityStatus =
  (typeof PAYLOAD_AMBIGUITY_STATUS_VALUES)[number];

export const PAYLOAD_CLOSURE_DECISION_KIND_VALUES = Object.freeze([
  "close",
  "retry",
  "reprice",
  "block",
  "qualified_defer"
] as const);

export type PayloadClosureDecisionKind =
  (typeof PAYLOAD_CLOSURE_DECISION_KIND_VALUES)[number];

export interface PayloadObservedRuntimeEvent {
  readonly kind: "payload_observed";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly payloadRef: string;
  readonly payloadClass: string;
  readonly schemaRef: string | null;
  readonly contractRef: string | null;
  readonly digest: string;
  readonly producerRef: string;
  readonly sourceEventRef: string | null;
  readonly actorInvocationId: string | null;
  readonly authorityRef: string | null;
  readonly inputDigest: string | null;
  readonly policyRefs: readonly string[];
}

export interface PayloadValidatedRuntimeEvent {
  readonly kind: "payload_validated";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly payloadRef: string;
  readonly schemaRef: string | null;
  readonly contractRef: string | null;
  readonly contractDigest: string | null;
  readonly digest: string;
  readonly validationRef: string;
  readonly evidenceRef: string | null;
  readonly policyRefs: readonly string[];
}

export interface PayloadRejectedRuntimeEvent {
  readonly kind: "payload_rejected";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly payloadRef: string;
  readonly rejectionClass: PayloadRejectionClass;
  readonly schemaRef: string | null;
  readonly contractRef: string | null;
  readonly contractDigest: string | null;
  readonly digest: string | null;
  readonly reason: string;
  readonly policyRefs: readonly string[];
}

export interface AuthoritySnapshotAdmittedRuntimeEvent {
  readonly kind: "authority_snapshot_admitted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly authoritySnapshotRef: string;
  readonly authorityRefs: readonly string[];
  readonly inputRefs: readonly string[];
  readonly authorityDigest: string;
  readonly inputDigest: string;
  readonly closureCapable: boolean;
  readonly contradictoryAuthority: boolean;
  readonly deferredAuthorityRefs: readonly string[];
  readonly providerRefs: readonly string[];
  readonly policyRefs: readonly string[];
}

export interface EvidenceAdmittedRuntimeEvent {
  readonly kind: "evidence_admitted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly evidenceRef: string;
  readonly payloadRef: string;
  readonly authorityRef: string | null;
  readonly authorityDigest: string | null;
  readonly inputDigest: string | null;
  readonly providerRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly complete: boolean;
  readonly shallow: boolean;
  readonly contradictsAuthority: boolean;
  readonly deferred: boolean;
}

export interface AmbiguityObservationAdmittedRuntimeEvent {
  readonly kind: "ambiguity_observation_admitted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly ambiguityRef: string;
  readonly ambiguityStatus: PayloadAmbiguityStatus;
  readonly authorityRef: string | null;
  readonly evidenceRef: string | null;
  readonly payloadRef: string | null;
  readonly reason: string;
  readonly providerRefs: readonly string[];
  readonly policyRefs: readonly string[];
}

export interface ClosureInputPublishedRuntimeEvent {
  readonly kind: "closure_input_published";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly closureInputRef: string;
  readonly projectionRef: string;
  readonly closureDecision: PayloadClosureDecisionKind;
  readonly rowRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly policyRefs: readonly string[];
}

export interface ObservedStateAdmittedRuntimeEvent {
  readonly kind: "observed_state_admitted";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly observedStateRef: string;
  readonly sourceKind: ObservedStateSourceKind;
  readonly scopeRef: string;
  readonly sourceRef: string;
  readonly digest: string;
  readonly version: string | null;
  readonly eventWatermark: number;
  readonly freshnessPolicyRef: string;
  readonly derivationBasisRef: string;
  readonly basisProjectionRef: string;
  readonly derivedFromRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface FdAuthorityOutcomeAdmittedRuntimeEvent {
  readonly kind: "fd_authority_outcome_admitted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly outcomeRef: string;
  readonly status: "accepted" | "blocked";
  readonly severityClass: FdAuthoritySeverityClass | null;
  readonly routingDecision: FdPressureRoutingDecision;
  readonly affectedFieldRefs: readonly string[];
  readonly consumedFieldRefs: readonly string[];
  readonly pressureRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface OverlayFrameDeclaredEvent {
  readonly kind: "overlay_frame_declared";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly overlayFrameRef: string;
  readonly contractRef: string;
  readonly scopeRefs: readonly OverlayFrameScopeEventRow[];
  readonly fireWhen: OverlayFramePredicateEventRow;
  readonly terminateWhen: OverlayFramePredicateEventRow;
  readonly pressureRefs: readonly string[];
  readonly foldbackTargetRef: string | null;
  readonly reentryTargetVectorIndex: number | null;
  readonly noClosePolicyRef: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface OverlayFrameEvaluatedEvent {
  readonly kind: "overlay_frame_evaluated";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly overlayFrameRef: string;
  readonly contractRef: string;
  readonly outcomeRef: string;
  readonly fireSatisfied: boolean;
  readonly terminateSatisfied: boolean;
  readonly predicateEvaluations: readonly OverlayFramePredicateEvaluationEventRow[];
  readonly pressureDecision: OverlayFramePressureDecisionKind;
  readonly pressureRefs: readonly string[];
  readonly carriedPressureRefs: readonly string[];
  readonly clearedPressureRefs: readonly string[];
  readonly clearingEvidenceRefs: readonly string[];
  readonly foldbackTargetRef: string | null;
  readonly reentryTargetVectorIndex: number | null;
  readonly diagnosticRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface OutputInstanceAllocatedEvent {
  readonly kind: "output_instance_allocated";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly allocationId: string;
  readonly assetRef: string;
  readonly assetType: string;
  readonly outputName: string;
  readonly materializationRoot: string;
  readonly materializationUri: string;
  readonly allowedWriteRoots: readonly string[];
  readonly inputWorkspaceRoot: string;
  readonly outputWorkspaceRef: string;
  readonly outputWorkspaceRoot: string;
  readonly outputWorkspaceAuthorityRef: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export interface OutputBindingAdmittedEvent {
  readonly kind: "output_binding_admitted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly bindingRef: string;
  readonly allocationId: string;
  readonly assetRef: string;
  readonly assetType: string;
  readonly bindingRole: "output";
  readonly source: "abg_allocation";
  readonly allowedWriteRoots: readonly string[];
  readonly outputWorkspaceRef: string;
  readonly outputWorkspaceRoot: string;
  readonly outputWorkspaceAuthorityRef: string | null;
}

export interface OutputMaterializationObservedEvent {
  readonly kind: "output_materialization_observed";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly allocationId: string;
  readonly assetRef: string;
  readonly materializedRef: string;
  readonly materializedPath: string;
  readonly digest: string;
  readonly observerRef: string;
  readonly artifactRefs: readonly string[];
}

export interface WorkspaceObligationLedgerAdmittedEvent {
  readonly kind: "workspace_obligation_ledger_admitted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly ledgerRef: string;
  readonly workspaceAssetRef: string;
  readonly authorityDigest: string;
  readonly obligationRefs: readonly string[];
}

export interface WorkspaceObligationScheduleDerivedEvent {
  readonly kind: "workspace_obligation_schedule_derived";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly scheduleRef: string;
  readonly ledgerRef: string;
  readonly scheduleItemRefs: readonly string[];
}

export interface ZoomFrameOpenedRuntimeEvent {
  readonly kind: "zoom_frame_opened";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly zoomFrameId: string;
  readonly inputAssetRef: string;
  readonly outputAssetRef: string;
  readonly ledgerRef: string;
  readonly scheduleRef: string;
}

export interface ScheduledSliceDispatchedRuntimeEvent {
  readonly kind: "scheduled_slice_dispatched";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly zoomFrameId: string;
  readonly scheduleItemId: string;
  readonly obligationId: string;
  readonly attemptIndex: number;
  readonly handoffRef: string;
  readonly pluginRef: string;
  readonly outputAssetRef: string;
}

export interface ScheduledSliceAssessedRuntimeEvent {
  readonly kind: "scheduled_slice_assessed";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly zoomFrameId: string;
  readonly assessmentId: string;
  readonly scheduleItemId: string;
  readonly obligationId: string;
  readonly attemptIndex: number;
  readonly status: "fulfilled" | "partial" | "blocked" | "runtime_failed";
  readonly assessmentRegime: RuntimeRegime;
  readonly findingClass:
    | "fulfilled"
    | "semantic_fulfillment_gap"
    | "traceability_reference_gap"
    | null;
  readonly evidenceRefs: readonly string[];
  readonly outputRefs: readonly string[];
  readonly runtimeFailureClass: RuntimeFailureClass | null;
  readonly detail: string | null;
}

export interface ZoomFoldbackEvaluatedRuntimeEvent {
  readonly kind: "zoom_foldback_evaluated";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly zoomFrameId: string;
  readonly foldbackRef: string;
  readonly decision: "close" | "retry_scheduled_slice" | "carry_loopback_pressure" | "blocked" | "reprice_required";
  readonly fulfilledCount: number;
  readonly openCount: number;
  readonly blockedCount: number;
  readonly runtimeFailureCount: number;
  readonly missingAssessmentCount: number;
  readonly conflictingCount: number;
}

export interface TraversalModulationResolvedEvent {
  readonly kind: "traversal_modulation_resolved";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly profileRef: string;
  readonly strategySelectionRef: string;
  readonly strategySelectionSource: "graph_vector" | "graph_function" | "role_policy" | "runtime_start" | "runtime_default";
  readonly strategySelectionSourceRef: string;
  readonly strategySelectionAttrKey: string | null;
  readonly strategySelectionHookRef: string | null;
  readonly strategyConfigDigest: string;
  readonly strategyDirectiveRef: string;
  readonly strategyOwnerRef: string;
  readonly strategyLabel: string;
  readonly enforcementPrimitives: readonly string[];
  readonly obligationScheduleRefs: readonly string[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly backendProfileRef: string;
  readonly policyRefs: readonly string[];
  readonly gapPressureRefs: readonly string[];
  readonly affectRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface TraversalAttemptEnvelopeDerivedEvent {
  readonly kind: "traversal_attempt_envelope_derived";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly envelopeRef: string;
  readonly profileRef: string;
  readonly strategySelectionRef: string;
  readonly strategySelectionSource: "graph_vector" | "graph_function" | "role_policy" | "runtime_start" | "runtime_default";
  readonly strategyConfigDigest: string;
  readonly strategyDirectiveRef: string;
  readonly backendProfileRef: string;
  readonly actorInvocationId: string;
  readonly selectedScheduleItemRefs: readonly string[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly requiredProgressArtifactRefs: readonly string[];
  readonly gapPressureRefs: readonly string[];
  readonly affectRefs: readonly string[];
  readonly retryBudgetRemaining: number;
  readonly mustExitAfterBoundedAttempt: boolean;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface TraversalAttemptDispatchedEvent {
  readonly kind: "traversal_attempt_dispatched";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly envelopeRef: string;
  readonly actorInvocationId: string;
  readonly dispatchRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface TraversalAttemptProgressObservedEvent {
  readonly kind: "traversal_attempt_progress_observed";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly envelopeRef: string;
  readonly rowRef: string;
  readonly scheduleItemRef: string;
  readonly declaredOutcome: "fulfilled" | "partial" | "blocked" | "not_attempted";
  readonly artifactRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly remainingWorkRefs: readonly string[];
  readonly reviewRequired: boolean;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface TraversalAttemptNonProgressClassifiedEvent {
  readonly kind: "traversal_attempt_non_progress_classified";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly envelopeRef: string;
  readonly sourceCarrierRef: string;
  readonly actionProjectionRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface TraversalForcedReviewProjectedEvent {
  readonly kind: "traversal_forced_review_projected";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly envelopeRef: string;
  readonly gateRef: string;
  readonly trigger: string;
  readonly triggeredScheduleItemRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly requiredRegime: RuntimeRegime;
  readonly publicAction: "forced_review";
  readonly blocksPrivateContinuation: true;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface TraversalSameEdgeContinuationPlannedEvent {
  readonly kind: "traversal_same_edge_continuation_planned";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly envelopeRef: string;
  readonly remainingScheduleItemRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface TraversalModulationExhaustedEvent {
  readonly kind: "traversal_modulation_exhausted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly envelopeRef: string;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export const GRAPH_CHANGE_CLASS_VALUES = Object.freeze([
  "goal_reprice",
  "intent_reprice",
  "product_reprice",
  "requirement_reprice",
  "design_reframe",
  "realization_refactor"
] as const);

export type GraphChangeClass =
  (typeof GRAPH_CHANGE_CLASS_VALUES)[number];

export const GRAPH_REENTRY_POINT_VALUES = Object.freeze([
  "goals",
  "intent",
  "product_definition",
  "requirements",
  "design_surface",
  "realization",
  "proof"
] as const);

export type GraphReentryPoint =
  (typeof GRAPH_REENTRY_POINT_VALUES)[number];

export const GRAPH_SPAN_OBLIGATION_ASSESSMENT_STATUS_VALUES = Object.freeze([
  "fulfilled",
  "semantic_gap",
  "traceability_gap",
  "constitutional_gap",
  "stale_input",
  "contradictory_evidence",
  "blocked"
] as const);

export type GraphSpanObligationAssessmentStatus =
  (typeof GRAPH_SPAN_OBLIGATION_ASSESSMENT_STATUS_VALUES)[number];

export const GRAPH_SPAN_CARRY_OBSERVATION_STATUS_VALUES = Object.freeze([
  "carried",
  "dropped",
  "mutated",
  "unknown"
] as const);

export type GraphSpanCarryObservationStatus =
  (typeof GRAPH_SPAN_CARRY_OBSERVATION_STATUS_VALUES)[number];

export interface GraphSpanCarryObservationEventRow {
  readonly fromVectorIndex: number;
  readonly toVectorIndex: number;
  readonly status: GraphSpanCarryObservationStatus;
  readonly evidenceRefs: readonly string[];
}

export interface GraphSpanAssessmentEventRow {
  readonly obligationId: string;
  readonly sourceAuthorityRef: string;
  readonly status: GraphSpanObligationAssessmentStatus;
  readonly terminalEvidenceRefs: readonly string[];
  readonly carryObservations: readonly GraphSpanCarryObservationEventRow[];
  readonly detail: string | null;
}

export interface GraphConstitutionalReentryEventPayload {
  readonly kind: "graph_constitutional_reentry";
  readonly changeClass: GraphChangeClass;
  readonly reEntryPoint: GraphReentryPoint;
  readonly targetGraphFunctionRef: string | null;
  readonly targetVectorIndex: number | null;
  readonly routeContractRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly rationale: string;
}

export type GraphSpanFoldbackDecision =
  | "close"
  | "retry_terminal_edge"
  | "reenter_at_vector"
  | "constitutional_reentry"
  | "reprice_required"
  | "blocked";

export type GraphReentryFrontierDecision =
  | "advance"
  | "reenter"
  | "constitutional_reentry"
  | "reprice"
  | "block";

export interface GraphSpanEvaluationScheduledEvent {
  readonly kind: "graph_span_evaluation_scheduled";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly terminalVectorIndex: number;
  readonly terminalEdge: string;
  readonly scheduleRef: string;
  readonly spanIds: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly generation: number;
}

export interface GraphSpanAssessedEvent {
  readonly kind: "graph_span_assessed";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly terminalVectorIndex: number;
  readonly terminalEdge: string;
  readonly sourceVectorIndex: number;
  readonly spanId: string;
  readonly sourceNodeRef: string;
  readonly terminalNodeRef: string;
  readonly coveredVectorIndexes: readonly number[];
  readonly assessmentId: string;
  readonly attemptIndex: number;
  readonly assessmentRegime: RuntimeRegime;
  readonly obligationRows: readonly GraphSpanAssessmentEventRow[];
  readonly constitutionalReentry: GraphConstitutionalReentryEventPayload | null;
  readonly evidenceRefs: readonly string[];
  readonly edgeFoldbackRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly detail: string | null;
  readonly generation: number;
}

export interface GraphSpanFoldbackEvaluatedEvent {
  readonly kind: "graph_span_foldback_evaluated";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly terminalVectorIndex: number;
  readonly terminalEdge: string;
  readonly foldbackRef: string;
  readonly spanAssessmentRefs: readonly string[];
  readonly edgeFoldbackRefs: readonly string[];
  readonly causingEdgeFoldbackRefs: readonly string[];
  readonly decision: GraphSpanFoldbackDecision;
  readonly fulfilledCount: number;
  readonly gapCount: number;
  readonly staleInputCount: number;
  readonly blockedCount: number;
  readonly contradictoryCount: number;
  readonly reentryCandidateVectorIndexes: readonly number[];
  readonly earliestReentryVectorIndex: number | null;
  readonly constitutionalReentries: readonly GraphConstitutionalReentryEventPayload[];
  readonly causingObligationRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly generation: number;
}

export interface GraphReentryPlannedEvent {
  readonly kind: "graph_reentry_planned";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly planRef: string;
  readonly fromTerminalVectorIndex: number;
  readonly targetVectorIndex: number | null;
  readonly changeClass: GraphChangeClass | null;
  readonly reEntryPoint: GraphReentryPoint | null;
  readonly routeContractRefs: readonly string[];
  readonly causingFrontierRowRefs: readonly string[];
  readonly shadowedVectorIndexes: readonly number[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly reason: string;
  readonly generation: number;
}

export interface GraphReentryAppliedEvent {
  readonly kind: "graph_reentry_applied";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly planRef: string;
  readonly targetVectorIndex: number | null;
  readonly changeClass: GraphChangeClass | null;
  readonly reEntryPoint: GraphReentryPoint | null;
  readonly routeContractRefs: readonly string[];
  readonly causingFrontierRowRefs: readonly string[];
  readonly shadowedVectorIndexes: readonly number[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly generation: number;
}

export type TimerOutcomeKind = "timer_fired" | "timer_cancelled" | "timer_missed";

export interface TimerIntentAdmittedEvent {
  readonly kind: "timer_intent_admitted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly constraintRef: string;
  readonly timerIntentRef: string;
  readonly providerRef: string;
  readonly notBeforeRef: string;
  readonly schedulePolicyRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface TimerOutcomeAdmittedEvent {
  readonly kind: "timer_outcome_admitted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly constraintRef: string;
  readonly schedulePolicyRef: string;
  readonly timerIntentRef: string;
  readonly timerOutcomeRef: string;
  readonly outcome: TimerOutcomeKind;
  readonly providerRef: string;
  readonly providerReceiptRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface DeadlineBreachAdmittedEvent {
  readonly kind: "deadline_breach_admitted";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly deadlineBreachRef: string;
  readonly constraintRef: string;
  readonly schedulePolicyRef: string;
  readonly deadlineRef: string;
  readonly deadlineBreachAction:
    | "observe_drift"
    | "block"
    | "retry"
    | "human_gate"
    | "reprice";
  readonly providerRef: string;
  readonly providerReceiptRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface ScheduledContinuationReopenedEvent {
  readonly kind: "scheduled_continuation_reopened";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly scheduledContinuationRef: string;
  readonly constraintRef: string;
  readonly schedulePolicyRef: string;
  readonly timerIntentRef: string;
  readonly timerOutcomeRef: string;
  readonly providerRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface BranchRuntimeScope {
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frontierRef: string;
  readonly branchRef: string;
  readonly branchAttemptRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface BranchLeaseAcquiredEvent extends BranchRuntimeScope {
  readonly kind: "branch_lease_acquired";
  readonly leaseRef: string;
  readonly leasedWriteTerritoryRefs: readonly string[];
  readonly leasedOutputAllocationRefs: readonly string[];
  readonly leasedAtMs: number;
  readonly expiresAtMs: number | null;
}

export interface BranchLeaseReleasedEvent extends BranchRuntimeScope {
  readonly kind: "branch_lease_released";
  readonly leaseRef: string;
  readonly releasedAtMs: number;
}

export interface BranchLeaseSupersededEvent extends BranchRuntimeScope {
  readonly kind: "branch_lease_superseded";
  readonly leaseRef: string;
  readonly supersededByLeaseRef: string;
}

export interface BranchTaskFailedEvent extends BranchRuntimeScope {
  readonly kind: "branch_task_failed";
  readonly leaseRef: string;
  readonly failureRef: string;
  readonly failureClass: RuntimeFailureClass;
  readonly failureDigest: string;
  readonly disposition: BranchExecutionDisposition;
  readonly preserveEvidence: boolean;
  readonly evidenceRefs: readonly string[];
}

export interface BranchPayloadAdmittedEvent extends BranchRuntimeScope {
  readonly kind: "branch_payload_admitted";
  readonly fanInScopeRef: string;
  readonly idempotencyKey: string;
  readonly payloadDigest: string;
  readonly evidenceRefs: readonly string[];
  readonly sourceEventRef: string | null;
}

export interface BranchFanInProjectedEvent {
  readonly kind: "branch_fan_in_projected";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frontierRef: string;
  readonly fanInRef: string;
  readonly fanInDigest: string;
  readonly orderedBranchRefs: readonly string[];
  readonly payloadDigests: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface ConstructionRuntimeEventScope {
  readonly constructionEventRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly episodeId: string;
  readonly iterationOrdinal: number;
  readonly eventSequence: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface ConstructionEpisodeStartedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_episode_started";
  readonly startProjectionRef: string;
}

export interface ConstructionObservationSnapshotMaterializedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_observation_snapshot_materialized";
  readonly observationId: string;
  readonly currentProjectionRef: string;
  readonly observedStateRefs: readonly string[];
  readonly linkedAssetRefs: readonly string[];
  readonly authorityDigest: string;
}

export interface ConstructionActionCatalogProjectedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_action_catalog_projected";
  readonly catalogRef: string;
  readonly hookResolutionRef: string;
  readonly fallbackConfigDigest: string;
  readonly traversalPublicationRefs: readonly string[];
}

export interface ConstructionEvaluatorInvokedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_evaluator_invoked";
  readonly observationId: string;
  readonly catalogRef: string;
  readonly evaluatorPluginRef: string;
  readonly inputDigest: string;
}

export interface ConstructionIntentCandidateReturnedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_intent_candidate_returned";
  readonly evaluatorPluginRef: string;
  readonly evaluatorOutcomeRef: string;
  readonly candidateSetDigest: string;
  readonly candidateRefs: readonly string[];
}

export interface ConstructionIntentCandidateAdmittedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_intent_candidate_admitted";
  readonly candidateId: string;
  readonly admissionRef: string;
  readonly intentId: string;
  readonly authorityRefs: readonly string[];
}

export interface ConstructionIntentCandidateRejectedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_intent_candidate_rejected";
  readonly candidateId: string;
  readonly admissionRef: string;
  readonly rejectionReasonRefs: readonly string[];
  readonly authorityRefs: readonly string[];
}

export interface ConstructionIntentSelectedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_intent_selected";
  readonly intentId: string;
  readonly selectedActionRef: string;
  readonly selectedBindingRef: string;
  readonly selectionPolicyRef: string;
}

export interface ConstructionGraphActionInvokedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_graph_action_invoked";
  readonly intentId: string;
  readonly selectedActionRef: string;
  readonly runtimeInvocationPlanRef: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly continuationId: string | null;
  readonly selectedGraphFunctionRef: string | null;
  readonly selectedVectorRef: string | null;
}

export interface ConstructionPressurePackageMaterializedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_pressure_package_materialized";
  readonly packageRef: string;
  readonly packageDigest: string;
  readonly observationId: string;
  readonly selectedIntentId: string;
  readonly selectedActionRef: string;
  readonly selectedOutcomeRef: string;
  readonly executionTargetRef: string;
  readonly runtimeProjectionRef: string;
  readonly constructionProjectionRef: string;
  readonly overlayFrameProjectionRef: string;
  readonly observedStateRefs: readonly string[];
  readonly pressureRefs: readonly string[];
  readonly fdOutcomeRefs: readonly string[];
  readonly overlayFrameRefs: readonly string[];
  readonly intentLineageRefs: readonly string[];
  readonly expectedOutputAssetRefs: readonly string[];
  readonly carriedObligationRefs: readonly string[];
  readonly gapRefs: readonly string[];
  readonly targetStateRefs: readonly string[];
  readonly priorEvidenceRefs: readonly string[];
  readonly lawfulBasisRefs: readonly string[];
  readonly obligationPolicyRefs: readonly string[];
}

export interface ConstructionDeltaObservedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_delta_observed";
  readonly intentId: string;
  readonly attemptOrdinal: number;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly continuationId: string | null;
  readonly deltaRef: string;
  readonly assetDeltaRefs: readonly string[];
  readonly runtimeEventRefs: readonly string[];
  readonly beforeProjectionRef: string;
  readonly afterProjectionRef: string;
  readonly artifactDigestBefore: string | null;
  readonly artifactDigestAfter: string | null;
  readonly blockerBefore: string | null;
  readonly blockerAfter: string | null;
  readonly fulfilledObligationRefs: readonly string[];
  readonly remainingObligationRefs: readonly string[];
  readonly newEvidenceRefs: readonly string[];
  readonly fhDecisionAccepted: boolean;
  readonly reentryMoved: boolean;
  readonly closed: boolean;
}

export type ConstructionTerminalPublicState =
  | "construction_closed"
  | "construction_blocked"
  | "construction_review_required"
  | "construction_escalated"
  | "fh_input_required"
  | "ticket_created"
  | "reprice_required";

export interface ConstructionTerminalDispositionProjectedEvent
  extends ConstructionRuntimeEventScope {
  readonly kind: "construction_terminal_disposition_projected";
  readonly terminalProjectionRef: string;
  readonly publicState: ConstructionTerminalPublicState;
  readonly selectedActionRef: string | null;
  readonly selectedIntentId: string | null;
  readonly terminalRouteRefs: readonly string[];
  readonly reviewReasonRefs: readonly string[];
}

export const WORKSPACE_INSTALLATION_RESULT_VALUES = Object.freeze([
  "installed"
] as const);

export type WorkspaceInstallationResult =
  (typeof WORKSPACE_INSTALLATION_RESULT_VALUES)[number];

export interface WorkspaceInstallationAdmittedRuntimeEvent {
  readonly kind: "workspace_installation_admitted";
  readonly installResult: WorkspaceInstallationResult;
  readonly targetRoot: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly resolvedRuntimeRef: string;
  readonly installManifestPath: string;
  readonly installerEcosystem: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface RequirementRouteFactProjectedRuntimeEvent {
  readonly kind: "requirement_route_fact_projected";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly routeEventRef: string;
  readonly routePayloadKind: string;
  readonly routePayloadRef: string;
  readonly routePayloadDigest: string;
  readonly requirementPayload: unknown;
  readonly sourceEventRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface ExecutivePressureFactProjectedRuntimeEvent {
  readonly kind: "executive_pressure_fact_projected";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly eventRef: string;
  readonly observationRef: string;
  readonly pressureFactRef: string;
  readonly pressureFactDigest: string;
  readonly executivePressureFact: unknown;
  readonly sourceEventRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface NodeTypeSatisfactionProjectedRuntimeEvent {
  readonly kind: "node_type_satisfaction_projected";
  readonly satisfactionRef: string;
  readonly nodeRef: string;
  readonly targetTypeRef: string;
  readonly sourceNodeTypeRef: string | null;
  readonly satisfied: boolean;
  readonly rejectionReason: string | null;
  readonly typeNodeRef: string | null;
  readonly nodeTypeGraphFunctionRefs: readonly string[];
  readonly satisfactionDigest: string;
  readonly satisfactionPayload: unknown;
  readonly sourceEventRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface RegistryEntryAdmittedRuntimeEvent {
  readonly kind: "registry_entry_admitted";
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly declarationDigest: string;
  readonly libraryScope: "system" | "product";
  readonly entryKind:
    | "graph_function"
    | "overlay"
    | "candidate_family"
    | "node_type"
    | "public_start"
    | "plugin";
  readonly namespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly graphFunctionRef: string;
  readonly interfaceRef: string;
  readonly sourceContractRef: string;
  readonly targetContractRef: string;
  readonly contextRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly overlayRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly refinementOfEntryRef: string | null;
  readonly overrideOfEntryRef: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface RegistryEntryRejectedRuntimeEvent {
  readonly kind: "registry_entry_rejected";
  readonly declarationRef: string;
  readonly declarationDigest: string;
  readonly libraryScope: "system" | "product";
  readonly entryKind:
    | "graph_function"
    | "overlay"
    | "candidate_family"
    | "node_type"
    | "public_start"
    | "plugin";
  readonly namespace: string;
  readonly ownerRef: string;
  readonly rejectionReason: string;
  readonly conflictingEntryRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface RegistryPluginAdviceAdmittedRuntimeEvent {
  readonly kind: "registry_plugin_advice_admitted";
  readonly adviceRef: string;
  readonly adviceDigest: string;
  readonly pluginRef: string;
  readonly lookupResultRef: string;
  readonly preferredCandidateRef: string | null;
  readonly rankedCandidateRefs: readonly string[];
  readonly constraintRefs: readonly string[];
  readonly rationaleRef: string;
  readonly policyRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface RegistryPluginAdviceRejectedRuntimeEvent {
  readonly kind: "registry_plugin_advice_rejected";
  readonly pluginRef: string;
  readonly lookupResultRef: string;
  readonly rejectionReason: string;
  readonly invalidCandidateRefs: readonly string[];
  readonly authorityViolationRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface GraphFunctionSelectedRuntimeEvent {
  readonly kind: "graph_function_selected";
  readonly selectionRef: string;
  readonly selectedEntryRef: string;
  readonly selectedEntryKind: "graph_function";
  readonly selectedGraphFunctionRef: string;
  readonly lookupResultRef: string;
  readonly eligibilityDecisionRefs: readonly string[];
  readonly adviceRefs: readonly string[];
  readonly fhResponseRefs: readonly string[];
  readonly rationaleRef: string;
  readonly runtimeBasisRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface GraphFunctionSelectionRejectedRuntimeEvent {
  readonly kind: "graph_function_selection_rejected";
  readonly lookupResultRef: string;
  readonly rejectionReason: string;
  readonly rejectedCandidateRefs: readonly string[];
  readonly pressureDispositionRef: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export type RuntimeEvent =
  | BasisAdmittedEvent
  | LeverResolutionAdmittedEvent
  | FdAdvanceReadyEvent
  | FpDispatchRequestedEvent
  | ActorInvocationStartedEvent
  | ActorResultArtifactObservedEvent
  | ActorInvocationClosedEvent
  | ActorProcessStartedEvent
  | ActorProcessStartFailedEvent
  | ActorProcessStreamObservedEvent
  | ActorProcessHeartbeatEvent
  | ActorProcessTimeoutEvent
  | ActorProcessSignalSentEvent
  | ActorProcessExitedEvent
  | RuntimeActivityProbeObservedEvent
  | RuntimeExternalInterruptionObservedEvent
  | PluginTraversalPromptMaterializedEvent
  | InstructionCausalContextBoundEvent
  | FhEscalatedEvent
  | TerminalReachedEvent
  | GraphCallOpenedEvent
  | FrameOpenedEvent
  | VectorTraversalPlannedEvent
  | VectorEvaluatedEvent
  | VectorClosedEvent
  | GraphVectorResumeCursorAppliedEvent
  | RetryRepairPlannedEvent
  | RetryAttemptOpenedEvent
  | RetryAttemptStoppedEvent
  | RetryAttemptEscalatedEvent
  | RetryProgressRecordedEvent
  | ContinuationTerminatedEvent
  | ContinuationReopenedEvent
  | LeafTaskOpenedEvent
  | LeafTaskCompletedEvent
  | LeafTaskFailedEvent
  | ApprovedRuntimeEvent
  | RevokedRuntimeEvent
  | ResetRuntimeEvent
  | AssessedRuntimeEvent
  | PayloadObservedRuntimeEvent
  | PayloadValidatedRuntimeEvent
  | PayloadRejectedRuntimeEvent
  | AuthoritySnapshotAdmittedRuntimeEvent
  | EvidenceAdmittedRuntimeEvent
  | AmbiguityObservationAdmittedRuntimeEvent
  | ClosureInputPublishedRuntimeEvent
  | ObservedStateAdmittedRuntimeEvent
  | FdAuthorityOutcomeAdmittedRuntimeEvent
  | OverlayFrameDeclaredEvent
  | OverlayFrameEvaluatedEvent
  | OutputInstanceAllocatedEvent
  | OutputBindingAdmittedEvent
  | OutputMaterializationObservedEvent
  | WorkspaceObligationLedgerAdmittedEvent
  | WorkspaceObligationScheduleDerivedEvent
  | ZoomFrameOpenedRuntimeEvent
  | ScheduledSliceDispatchedRuntimeEvent
  | ScheduledSliceAssessedRuntimeEvent
  | ZoomFoldbackEvaluatedRuntimeEvent
  | TraversalModulationResolvedEvent
  | TraversalAttemptEnvelopeDerivedEvent
  | TraversalAttemptDispatchedEvent
  | TraversalAttemptProgressObservedEvent
  | TraversalAttemptNonProgressClassifiedEvent
  | TraversalForcedReviewProjectedEvent
  | TraversalSameEdgeContinuationPlannedEvent
  | TraversalModulationExhaustedEvent
  | GraphSpanEvaluationScheduledEvent
  | GraphSpanAssessedEvent
  | GraphSpanFoldbackEvaluatedEvent
  | GraphReentryPlannedEvent
  | GraphReentryAppliedEvent
  | TimerIntentAdmittedEvent
  | TimerOutcomeAdmittedEvent
  | DeadlineBreachAdmittedEvent
  | ScheduledContinuationReopenedEvent
  | BranchLeaseAcquiredEvent
  | BranchLeaseReleasedEvent
  | BranchLeaseSupersededEvent
  | BranchTaskFailedEvent
  | BranchPayloadAdmittedEvent
  | BranchFanInProjectedEvent
  | ConstructionEpisodeStartedEvent
  | ConstructionObservationSnapshotMaterializedEvent
  | ConstructionActionCatalogProjectedEvent
  | ConstructionEvaluatorInvokedEvent
  | ConstructionIntentCandidateReturnedEvent
  | ConstructionIntentCandidateAdmittedEvent
  | ConstructionIntentCandidateRejectedEvent
  | ConstructionIntentSelectedEvent
  | ConstructionGraphActionInvokedEvent
  | ConstructionPressurePackageMaterializedEvent
  | ConstructionDeltaObservedEvent
  | ConstructionTerminalDispositionProjectedEvent
  | RequirementRouteFactProjectedRuntimeEvent
  | ExecutivePressureFactProjectedRuntimeEvent
  | NodeTypeSatisfactionProjectedRuntimeEvent
  | RegistryEntryAdmittedRuntimeEvent
  | RegistryEntryRejectedRuntimeEvent
  | RegistryPluginAdviceAdmittedRuntimeEvent
  | RegistryPluginAdviceRejectedRuntimeEvent
  | GraphFunctionSelectedRuntimeEvent
  | GraphFunctionSelectionRejectedRuntimeEvent
  | WorkspaceInstallationAdmittedRuntimeEvent;

export interface CanonicalRuntimeEventEnvelope {
  readonly eventId: string;
  readonly eventTime: string;
  readonly eventTimeUnixMs: number;
  readonly eventAdmissionOrdinal: number;
}

export type CanonicalRuntimeEvent = RuntimeEvent & CanonicalRuntimeEventEnvelope;

export const RUNTIME_EVENT_KIND_VALUES = Object.freeze([
  "basis_admitted",
  "lever_resolution_admitted",
  "fd_advance_ready",
  "fp_dispatch_requested",
  "actor_invocation_started",
  "actor_result_artifact_observed",
  "actor_invocation_closed",
  "actor_process_started",
  "actor_process_start_failed",
  "actor_process_stream_observed",
  "actor_process_heartbeat",
  "actor_process_timeout",
  "actor_process_signal_sent",
  "actor_process_exited",
  "runtime_activity_probe_observed",
  "runtime_external_interruption_observed",
  "plugin_traversal_prompt_materialized",
  "instruction_causal_context_bound",
  "fh_escalated",
  "terminal_reached",
  "graph_call_opened",
  "frame_opened",
  "vector_traversal_planned",
  "vector_evaluated",
  "vector_closed",
  "graph_vector_resume_cursor_applied",
  "retry_repair_planned",
  "retry_attempt_opened",
  "retry_attempt_stopped",
  "retry_attempt_escalated",
  "retry_progress_recorded",
  "continuation_terminated",
  "continuation_reopened",
  "leaf_task_opened",
  "leaf_task_completed",
  "leaf_task_failed",
  "approved",
  "revoked",
  "reset",
  "assessed",
  "payload_observed",
  "payload_validated",
  "payload_rejected",
  "authority_snapshot_admitted",
  "evidence_admitted",
  "ambiguity_observation_admitted",
  "closure_input_published",
  "observed_state_admitted",
  "fd_authority_outcome_admitted",
  "overlay_frame_declared",
  "overlay_frame_evaluated",
  "output_instance_allocated",
  "output_binding_admitted",
  "output_materialization_observed",
  "workspace_obligation_ledger_admitted",
  "workspace_obligation_schedule_derived",
  "zoom_frame_opened",
  "scheduled_slice_dispatched",
  "scheduled_slice_assessed",
  "zoom_foldback_evaluated",
  "traversal_modulation_resolved",
  "traversal_attempt_envelope_derived",
  "traversal_attempt_dispatched",
  "traversal_attempt_progress_observed",
  "traversal_attempt_non_progress_classified",
  "traversal_forced_review_projected",
  "traversal_same_edge_continuation_planned",
  "traversal_modulation_exhausted",
  "graph_span_evaluation_scheduled",
  "graph_span_assessed",
  "graph_span_foldback_evaluated",
  "graph_reentry_planned",
  "graph_reentry_applied",
  "timer_intent_admitted",
  "timer_outcome_admitted",
  "deadline_breach_admitted",
  "scheduled_continuation_reopened",
  "branch_lease_acquired",
  "branch_lease_released",
  "branch_lease_superseded",
  "branch_task_failed",
  "branch_payload_admitted",
  "branch_fan_in_projected",
  "construction_episode_started",
  "construction_observation_snapshot_materialized",
  "construction_action_catalog_projected",
  "construction_evaluator_invoked",
  "construction_intent_candidate_returned",
  "construction_intent_candidate_admitted",
  "construction_intent_candidate_rejected",
  "construction_intent_selected",
  "construction_graph_action_invoked",
  "construction_pressure_package_materialized",
  "construction_delta_observed",
  "construction_terminal_disposition_projected",
  "requirement_route_fact_projected",
  "executive_pressure_fact_projected",
  "node_type_satisfaction_projected",
  "registry_entry_admitted",
  "registry_entry_rejected",
  "registry_plugin_advice_admitted",
  "registry_plugin_advice_rejected",
  "graph_function_selected",
  "graph_function_selection_rejected",
  "workspace_installation_admitted"
] as const satisfies readonly RuntimeEvent["kind"][]);

export interface AdmittedLeafTaskPayload {
  readonly kind: "admitted_leaf_task_payload";
  readonly schemaRef: string;
  readonly payloadRef: string;
  readonly value: Readonly<Record<string, unknown>>;
}

export interface RunProjection {
  readonly kind: "run_projection";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly vectorCount: number;
  readonly nextVectorIndex: number | null;
}

export interface GraphCallProjection {
  readonly kind: "graph_call_projection";
  readonly graphCallId: string | null;
  readonly graphFunctionId: string;
}

export interface FrameProjection {
  readonly kind: "frame_projection";
  readonly frameId: string | null;
  readonly frameLineageId: string | null;
  readonly plannedVectorIndexes: readonly number[];
  readonly evaluatedVectorIndexes: readonly number[];
  readonly closedVectorIndexes: readonly number[];
  readonly assessedEdges: readonly string[];
}

export interface ContinuationProjection {
  readonly kind: "continuation_projection";
  readonly retryAttemptRunIds: readonly string[];
  readonly retryAttemptManifestIds: readonly string[];
  readonly retryAttemptRefs: readonly {
    readonly vectorIndex: number;
    readonly retryRunId: string;
    readonly retryCallId: string;
    readonly manifestId: string;
    readonly priorManifestId: string;
    readonly attemptIndex: number;
    readonly sourceProjectionRef: string;
  }[];
  readonly retryProgressRefs: readonly {
    readonly vectorIndex: number;
    readonly retryRunId: string;
    readonly progressSignalRefs: readonly string[];
    readonly stationary: boolean;
  }[];
  readonly leafTaskIds: readonly string[];
  readonly completedLeafTaskIds: readonly string[];
  readonly failedLeafTaskIds: readonly string[];
}

export interface RuntimeAggregateProjection {
  readonly kind: "runtime_aggregate_projection";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly observedState: ObservedStateProjection;
  readonly overlayFrame: OverlayFrameProjection;
  readonly run: RunProjection;
  readonly graphCall: GraphCallProjection;
  readonly frame: FrameProjection;
  readonly continuation: ContinuationProjection;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorCount: number;
  readonly plannedVectorIndexes: readonly number[];
  readonly evaluatedVectorIndexes: readonly number[];
  readonly closedVectorIndexes: readonly number[];
  readonly assessedEdges: readonly string[];
  readonly retryAttemptRunIds: readonly string[];
  readonly retryAttemptManifestIds: readonly string[];
  readonly retryAttemptRefs: readonly {
    readonly vectorIndex: number;
    readonly retryRunId: string;
    readonly retryCallId: string;
    readonly manifestId: string;
    readonly priorManifestId: string;
    readonly attemptIndex: number;
    readonly sourceProjectionRef: string;
  }[];
  readonly retryProgressRefs: readonly {
    readonly vectorIndex: number;
    readonly retryRunId: string;
    readonly progressSignalRefs: readonly string[];
    readonly stationary: boolean;
  }[];
  readonly actorInvocationRefs: readonly {
    readonly vectorIndex: number;
    readonly actorInvocationId: string;
    readonly graphFunctionId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly edge: string;
    readonly runId: string | null;
    readonly workKey: string | null;
    readonly workerId: string;
    readonly backendId: string;
    readonly causationEventRefs: readonly string[];
    readonly correlationId: string;
    readonly attemptIndex: number;
    readonly dispatchRef: string;
    readonly resultRef: string;
  }[];
  readonly observedActorArtifactRefs: readonly {
    readonly vectorIndex: number;
    readonly actorInvocationId: string;
    readonly graphFunctionId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly edge: string;
    readonly runId: string | null;
    readonly workKey: string | null;
    readonly workerId: string;
    readonly backendId: string;
    readonly causationEventRefs: readonly string[];
    readonly correlationId: string;
    readonly resultRef: string;
    readonly artifactRef: string;
  }[];
  readonly actorProcessRefs: readonly {
    readonly vectorIndex: number;
    readonly actorInvocationId: string;
    readonly graphFunctionId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly edge: string;
    readonly runId: string | null;
    readonly workKey: string | null;
    readonly workerId: string;
    readonly backendId: string;
    readonly causationEventRefs: readonly string[];
    readonly correlationId: string;
    readonly pid: number | null;
    readonly stdoutRef: string;
    readonly stderrRef: string;
    readonly startFailed: boolean;
    readonly startFailureKind: ActorProcessStartFailureKind | null;
    readonly startFailureDetail: string | null;
    readonly terminalSessionId: string | null;
    readonly running: boolean;
    readonly latestHeartbeatIndex: number | null;
    readonly latestHeartbeatElapsedMs: number | null;
    readonly timeoutObserved: boolean;
    readonly timeoutMs: number | null;
    readonly timeoutElapsedMs: number | null;
    readonly signalSequence: readonly {
      readonly signal: "SIGTERM" | "SIGKILL";
      readonly elapsedMs: number;
    }[];
    readonly status: number | null;
    readonly signal: string | null;
    readonly timedOut: boolean;
    readonly error: string | null;
  }[];
  readonly actorProcessStreamRefs: readonly {
    readonly vectorIndex: number;
    readonly actorInvocationId: string;
    readonly streamName: "stdout" | "stderr";
    readonly streamRef: string;
    readonly chunkIndex: number;
    readonly byteLength: number;
  }[];
  readonly pluginTraversalPromptMaterializationRefs: readonly {
    readonly vectorIndex: number;
    readonly edge: string;
    readonly traversalKind: PluginTraversalKind;
    readonly materializationRef: string;
    readonly selectionRef: string;
    readonly selectionSource: PluginTraversalObserverBindingSource;
    readonly sourceRef: string;
    readonly attrKey: string | null;
    readonly hookRef: string;
    readonly actorInvocationId: string | null;
    readonly workerId: string | null;
    readonly backendId: string | null;
    readonly observerPromptRef: string;
    readonly renderedPromptRef: string;
    readonly promptInputDigest: string;
    readonly promptTemplateRef: string;
    readonly promptInputContractRef: string;
    readonly expectedOutputContractRef: string;
    readonly defaultsBundleRef: string | null;
    readonly defaultsBundleDigest: string | null;
    readonly defaultsPath: string | null;
    readonly defaultKey: string | null;
    readonly causationEventRefs: readonly string[];
    readonly correlationId: string;
  }[];
  readonly leafTaskIds: readonly string[];
  readonly completedLeafTaskIds: readonly string[];
  readonly failedLeafTaskIds: readonly string[];
  readonly nextVectorIndex: number | null;
}

export interface IterationAdvanceVectorDecision {
  readonly kind: "advance_vector";
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly regime: RuntimeRegime;
  readonly effectiveRegime: EffectiveVectorRegime;
}

export interface IterationConvergedDecision {
  readonly kind: "converged";
  readonly basis: ExecutionBasis;
  readonly terminalKind: "converged" | "nothing_to_do";
  readonly reason: string;
}

export type IterationAdvanceDecision =
  | IterationAdvanceVectorDecision
  | IterationConvergedDecision;
