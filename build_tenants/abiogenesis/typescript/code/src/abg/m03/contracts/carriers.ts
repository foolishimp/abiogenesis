// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-RUN
// Implements: REQ-R-ABG3-CONVERGENCE

import type { Graph, GraphFunction } from "../../../gtl/m01/contracts/carriers.js";
import type { Job } from "../../../gtl/m02/contracts/carriers.js";

export type RuntimeRegime = "F_D" | "F_P" | "F_H";

export const COMPUTE_BASIS_FAILURE_CLASS_VALUES = Object.freeze([
  "no_compute_basis"
] as const);

export type ComputeBasisFailureClass =
  (typeof COMPUTE_BASIS_FAILURE_CLASS_VALUES)[number];

export const RUNTIME_FAILURE_CLASS_VALUES = Object.freeze([
  "runtime_unavailable",
  "capability_missing",
  "runtime_failure",
  "payload_contract_failure"
] as const);

export type RuntimeFailureClass =
  (typeof RUNTIME_FAILURE_CLASS_VALUES)[number];

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
}

export interface ExecutionBasis {
  readonly id: string;
  readonly workspaceRoot: string;
  readonly moduleName: string;
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly job: Job;
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
  readonly status: "ready";
}

export interface FpDispatchTransition {
  readonly kind: "fp_dispatch";
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly dispatchRef: string;
}

export interface ActorInvocation {
  readonly kind: "actor_invocation";
  readonly actorInvocationId: string;
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly attemptIndex: number;
  readonly dispatchRef: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly resultRef: string;
}

export interface ActorInvocationRef {
  readonly actorInvocationId: string;
  readonly attemptIndex: number;
  readonly dispatchRef: string;
  readonly resultRef: string;
}

export interface FhEscalationTransition {
  readonly kind: "fh_escalation";
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly edge: string;
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

export interface ActorInvocationStartedEvent {
  readonly kind: "actor_invocation_started";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly actorInvocationId: string;
  readonly attemptIndex: number;
  readonly dispatchRef: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly resultRef: string;
}

export interface ActorResultArtifactObservedEvent {
  readonly kind: "actor_result_artifact_observed";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly actorInvocationId: string;
  readonly resultRef: string;
  readonly artifactRef: string;
}

export interface ActorInvocationClosedEvent {
  readonly kind: "actor_invocation_closed";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly actorInvocationId: string;
  readonly closureStatus: "completed" | "blocked" | "blocked_with_artifact";
  readonly resultRef: string | null;
  readonly detail: string | null;
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

export type RuntimeEvent =
  | BasisAdmittedEvent
  | FdAdvanceReadyEvent
  | FpDispatchRequestedEvent
  | ActorInvocationStartedEvent
  | ActorResultArtifactObservedEvent
  | ActorInvocationClosedEvent
  | FhEscalatedEvent
  | TerminalReachedEvent
  | GraphCallOpenedEvent
  | FrameOpenedEvent
  | VectorTraversalPlannedEvent
  | VectorEvaluatedEvent
  | VectorClosedEvent
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
  | ClosureInputPublishedRuntimeEvent;

export const RUNTIME_EVENT_KIND_VALUES = Object.freeze([
  "basis_admitted",
  "fd_advance_ready",
  "fp_dispatch_requested",
  "actor_invocation_started",
  "actor_result_artifact_observed",
  "actor_invocation_closed",
  "fh_escalated",
  "terminal_reached",
  "graph_call_opened",
  "frame_opened",
  "vector_traversal_planned",
  "vector_evaluated",
  "vector_closed",
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
  "closure_input_published"
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
    readonly attemptIndex: number;
    readonly dispatchRef: string;
    readonly resultRef: string;
  }[];
  readonly observedActorArtifactRefs: readonly {
    readonly vectorIndex: number;
    readonly actorInvocationId: string;
    readonly resultRef: string;
    readonly artifactRef: string;
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
