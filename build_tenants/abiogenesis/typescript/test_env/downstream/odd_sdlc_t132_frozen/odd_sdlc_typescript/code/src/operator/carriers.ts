// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-052
// Implements: REQ-F-ODDSDLC-053
// Implements: REQ-F-ODDSDLC-054
// Implements: REQ-F-ODDSDLC-055
// Implements: REQ-F-ODDSDLC-059
// Implements: REQ-F-ODDSDLC-060
// Implements: REQ-F-ODDSDLC-063
// Implements: REQ-F-ODDSDLC-065

import type {
  BranchRef,
  DependencyFrontierDeclaration,
  FpTransformRequest,
  FpTransformResult,
  RuntimeEvent,
  TracedProcessExecutorProfile,
  TracedProcessOutcome,
  TracedProcessStreamModel,
  TraversalAttemptEnvelope,
  GtlAdmittedStateRef,
  GtlConsequenceProjectionRef,
  GtlContractFulfillmentBinding,
  GtlEvaluation,
  GtlEvaluationFindingRef
} from "@abiogenesis/typescript-tenant";
import type { SdlcTraversalRequirementSatisfaction } from "../assurance/index.js";
import type {
  SdlcHookTransformProfile,
  SdlcHookTurnOutcome
} from "../hooks/index.js";
import type { SdlcPublicStartOutcome } from "../start/index.js";
import type {
  SdlcBlockingReason,
  SdlcBlockingReasonCode
} from "../shared/blocking_reason.js";
import type { SdlcSelectedAbgFnCompositionIdentity } from "./composition_identity.js";
import type { SdlcConformProjectProfile } from "../workspace/index.js";
import type {
  SdlcOverlayBinding,
  SdlcWorkCategoryGovernanceCategory
} from "../graph/index.js";
import type { SdlcTicketExecutionContract } from "../tickets/index.js";
import type {
  SdlcDependencyTraversalMethod,
  SdlcFeatureDependencyDagNodeKind,
  SdlcMinFpPressurePreservationMechanism,
  SdlcTraversalHopClass,
  SdlcTraversalOutcomeClass,
  SdlcZoomAdmissionDisposition
} from "../contracts/carrier_domain_catalog.js";
import type {
  SdlcConstructionIntent,
  SdlcEdgeClosureDecision,
  SdlcEdgeFulfillmentLedger,
  SdlcNextActionProjection,
  SdlcOverlaySegmentCompletion,
  SdlcWorksiteEvidence
} from "./traversal_consequence.js";
import type {
  SdlcEdgeGain,
  SdlcEdgeResidualPressure
} from "./edge_gain_closure.js";

export type {
  SdlcDependencyTraversalMethod,
  SdlcFeatureDependencyDagNodeKind,
  SdlcMinFpPressurePreservationMechanism,
  SdlcTraversalHopClass,
  SdlcTraversalOutcomeClass,
  SdlcZoomAdmissionDisposition
} from "../contracts/carrier_domain_catalog.js";

export type SdlcInstalledOperatorStatus =
  | "blocked"
  | "converged"
  | "fp_escalation"
  | "worker_invoked"
  | "worker_failed"
  | "worker_report_rejected";

export interface SdlcOperatorSummary {
  readonly kind: "sdlc_operator_summary";
  readonly workspaceRoot: string;
  readonly graphFunctionName: string | null;
  readonly currentEdge: string | null;
  readonly status: SdlcInstalledOperatorStatus | "dispatch_required";
  readonly obligationReview: {
    readonly status: "not_evaluated" | "passed" | "incomplete" | "blocked";
    readonly expected: number;
    readonly fulfilled: number;
    readonly partial: number;
    readonly blocked: number;
    readonly unfulfilled: number;
    readonly missing: number;
    readonly extra: number;
    readonly assessmentCount: number;
  };
  readonly admittedSemantic: {
    readonly status: "not_evaluated" | "admitted" | "blocked";
    readonly targetCarrierAdmissionStatus: string | null;
    readonly edgeConverged: boolean | null;
    readonly closureDisposition: string | null;
  };
  readonly blockingReason: string | null;
  readonly blockingReasons: readonly SdlcBlockingReason[];
  readonly nextLawfulAction: string;
  readonly archiveRoot: string | null;
}

export interface SdlcInstalledOperatorTraversalConsequence {
  readonly kind: "sdlc_installed_operator_traversal_consequence";
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly constructionIntent: SdlcConstructionIntent;
  readonly worksiteEvidence: SdlcWorksiteEvidence;
  readonly edgeGain?: SdlcEdgeGain;
  readonly edgeResidualPressure?: SdlcEdgeResidualPressure;
  readonly edgeFulfillmentLedger: SdlcEdgeFulfillmentLedger;
  readonly edgeClosureDecision: SdlcEdgeClosureDecision;
  readonly overlaySegmentCompletion: SdlcOverlaySegmentCompletion | null;
  readonly postActionOverlayBinding: SdlcOverlayBinding;
  readonly nextActionProjection: SdlcNextActionProjection;
  readonly admittedStateRef: GtlAdmittedStateRef;
  readonly consequenceProjection: GtlConsequenceProjectionRef;
}

export interface SdlcWorkerTransportContract {
  readonly kind: "sdlc_worker_transport_contract";
  readonly raw: string;
  readonly scheme: "process";
  readonly agentKey: string;
  readonly command: string;
  readonly args: readonly string[];
  readonly model: string | null;
  readonly effort: "low" | "medium" | "high" | "xhigh" | "max" | null;
  readonly codexSandboxMode: "read-only" | "workspace-write" | "danger-full-access";
  readonly workerId: string;
  readonly backendId: string;
}

export interface SdlcWorkerRunResult {
  readonly kind: "sdlc_worker_run_result";
  readonly lifecycleStatus?: "started" | "completed" | "interrupted";
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly executorProfile?: TracedProcessExecutorProfile;
  readonly terminalSessionId?: string | null;
  readonly streamModel?: TracedProcessStreamModel;
  readonly outcome?: TracedProcessOutcome;
  readonly traceRoot?: string;
  readonly traceResultRef?: string;
  readonly structuredEventCount?: number | null;
  readonly structuredParseFailureCount?: number | null;
  readonly apiRetryCount?: number | null;
  readonly toolCallCount?: number | null;
  readonly finalOutputRef?: string | null;
  readonly terminalTranscriptRef?: string | null;
  readonly status: number | null;
  readonly signal: string | null;
  readonly elapsedMs: number;
  readonly timedOut: boolean;
  readonly stdoutByteCount: number;
  readonly stderrByteCount: number;
  readonly stdoutPath: string;
  readonly stderrPath: string;
  readonly outputLastMessagePath: string | null;
  readonly error: string | null;
}

export interface SdlcWorkerProcessStartedContext {
  readonly kind: "sdlc_worker_process_started_context";
  readonly processStartedRef: string;
  readonly processEventsRef: string;
  readonly manifestRef: string;
  readonly promptRef: string;
  /** Process-level path to the archived projection report, not authority. */
  readonly reportRef: string;
  readonly outputRef: string;
  readonly stdoutRef: string;
  readonly stderrRef: string;
  readonly actorInvocationId: string;
  readonly edge: string;
  readonly vectorIndex: number;
  readonly pid: number | null;
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly executorProfile?: TracedProcessExecutorProfile;
  readonly terminalSessionId?: string | null;
  readonly streamModel?: TracedProcessStreamModel;
  readonly outcome?: TracedProcessOutcome;
  readonly traceRoot?: string;
  readonly traceResultRef?: string;
  readonly structuredEventCount?: number | null;
  readonly structuredParseFailureCount?: number | null;
  readonly apiRetryCount?: number | null;
  readonly toolCallCount?: number | null;
  readonly finalOutputRef?: string | null;
  readonly terminalTranscriptRef?: string | null;
  readonly timeoutMs: number;
  readonly inactivityTimeoutMs: number;
  readonly heartbeatMs: number;
}

export interface SdlcWorkerProcessSummary {
  readonly kind: "sdlc_worker_process_summary";
  readonly processStartedRef: string;
  readonly processEventsRef: string;
  readonly manifestRef: string;
  readonly promptRef: string;
  /** Process-level path to the archived projection report, not authority. */
  readonly reportRef: string;
  readonly outputRef: string;
  readonly stdoutRef: string;
  readonly stderrRef: string;
  readonly pid: number | null;
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly executorProfile?: TracedProcessExecutorProfile;
  readonly terminalSessionId?: string | null;
  readonly streamModel?: TracedProcessStreamModel;
  readonly outcome?: TracedProcessOutcome;
  readonly traceRoot?: string;
  readonly traceResultRef?: string;
  readonly structuredEventCount?: number | null;
  readonly structuredParseFailureCount?: number | null;
  readonly apiRetryCount?: number | null;
  readonly toolCallCount?: number | null;
  readonly finalOutputRef?: string | null;
  readonly terminalTranscriptRef?: string | null;
  readonly timeoutMs: number;
  readonly inactivityTimeoutMs: number;
  readonly heartbeatMs: number;
  readonly runtimeLivenessAuthority: "abiogenesis_runtime_liveness_observer_projection";
  readonly runtimeLivenessProjectionRef: string;
  readonly runtimeLivenessPolicyRef: string;
  readonly runtimeLivenessLeaseState: string;
  readonly runtimeLivenessDispositionAction: string;
  readonly runtimeLivenessDispositionReason: string;
  readonly lastHeartbeatIndex: number | null;
  readonly lastHeartbeatElapsedMs: number | null;
  readonly signalSequence: readonly {
    readonly signal: string;
    readonly elapsedMs: number;
  }[];
  readonly status: number | null;
  readonly signal: string | null;
  readonly elapsedMs: number;
  readonly timedOut: boolean;
  readonly error: string | null;
}

export type SdlcMaterializedProductFileRole =
  | "source"
  | "test"
  | "build_config"
  | "design"
  | "documentation"
  | "other";

export interface SdlcProductMaterializationContract {
  readonly kind: "sdlc_product_materialization_contract";
  readonly required: boolean;
  readonly activeTenant: string;
  readonly selectedOutputRoot: string;
  readonly tenantRoot: string;
  readonly relativePathBasis: "tenant_root";
  readonly declaredModuleNames: readonly string[];
  readonly buildExecutionContract: string;
  readonly testExecutionContract: string;
  readonly manifestFile: string;
  readonly requiredRoles: readonly SdlcMaterializedProductFileRole[];
  readonly executionShards: readonly SdlcExecutionShard[];
}

export interface SdlcExecutionShard {
  readonly kind: "sdlc_execution_shard";
  readonly shardId: string;
  readonly lane: "test";
  readonly moduleName: string;
  readonly command: string;
  readonly workingDirectory: string;
  readonly timeoutMs: number;
  readonly inactivityTimeoutMs: number;
  readonly expectedReportRefs: readonly string[];
  readonly allowedByproductGlobs: readonly string[];
  readonly requiredEvidenceKind: "sdlc_worker_execution_evidence";
  readonly retryPolicy: "same_shard_then_triage";
}

export interface SdlcBaseMaterializedProductFile {
  readonly kind: "sdlc_materialized_product_file";
  readonly role: SdlcMaterializedProductFileRole;
  readonly relativePath: string;
  readonly absolutePath: string;
  readonly digest: string;
  readonly byteCount: number;
  readonly requirementTraceObligationIds?: readonly string[] | undefined;
}

export interface SdlcCurrentAttemptMaterializedProductFile
  extends SdlcBaseMaterializedProductFile {
  readonly materializationSource: "current_attempt";
  readonly sourceManifestRef?: string | undefined;
  readonly sourceHandoffManifestRef?: string | undefined;
  readonly sourceAttemptRef?: string | undefined;
  readonly overwritesMaterializationRef?: string | undefined;
  readonly rolePolicyRef?: string | undefined;
}

export interface SdlcReplayedMaterializedProductFile
  extends SdlcBaseMaterializedProductFile {
  readonly materializationSource: "replay";
  readonly sourceManifestRef: string;
  readonly sourceHandoffManifestRef: string;
  readonly sourceAttemptRef: string;
  readonly rolePolicyRef?: string | undefined;
}

export type SdlcMaterializedProductFile =
  | SdlcCurrentAttemptMaterializedProductFile
  | SdlcReplayedMaterializedProductFile;

export const SDLC_COMPONENT_CONCERN_ROLES = Object.freeze([
  "parser",
  "validator",
  "mapper",
  "error_model",
  "io_adapter",
  "reporting",
  "domain_model",
  "other"
] as const);

export type SdlcComponentConcernRole =
  (typeof SDLC_COMPONENT_CONCERN_ROLES)[number];

export interface SdlcComponentTopologyRow {
  readonly kind: "sdlc_component_topology_row";
  readonly componentId: string;
  readonly moduleName: string;
  readonly relativePath: string;
  readonly publicBoundary: string;
  readonly concernRole: SdlcComponentConcernRole;
  readonly requirementIds: readonly string[];
  readonly sourceAssetRefs: readonly string[];
}

export interface SdlcComponentRealizationRow {
  readonly kind: "sdlc_component_realization_row";
  readonly componentId: string;
  readonly moduleName: string;
  readonly relativePath: string;
  readonly publicBoundary: string;
  readonly trancheId: string | null;
  readonly firstProductFileToChange: string | null;
  readonly upstreamComponentIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly sourceAssetRefs: readonly string[];
}

export interface SdlcTestComponentTopologyRow {
  readonly kind: "sdlc_test_component_topology_row";
  readonly testClassId: string;
  readonly relativePath: string;
  readonly testcaseIds: readonly string[];
  readonly componentIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly shardId: string | null;
}

export interface SdlcComponentTestRealizationRow {
  readonly kind: "sdlc_component_test_realization_row";
  readonly testClassId: string;
  readonly relativePath: string;
  readonly testcaseIds: readonly string[];
  readonly componentIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly shardId: string | null;
}

export type SdlcDecompositionUpstreamKind =
  | "requirement"
  | "design"
  | "module"
  | "component"
  | "testcase";

export type SdlcDecompositionDownstreamKind =
  | "design"
  | "module"
  | "component"
  | "function"
  | "test_module"
  | "test_class";

export type SdlcDecompositionAdmissionDecision = "admit" | "reject";

export interface SdlcDecompositionSummaryThresholds {
  readonly kind: "sdlc_decomposition_summary_thresholds";
  readonly profileRef: string;
  readonly maxUpstreamPerDownstreamRatio: number;
  readonly maxDownstreamPerUpstream: number;
  readonly maxOwnedUpstreamPerDownstream: number;
  readonly maxOwnedUpstreamWithoutBoundary: number;
}

export interface SdlcDecompositionSummaryRow {
  readonly downstreamId: string;
  readonly parentId: string | null;
  readonly ownedUpstreamRefs: readonly string[];
  readonly ownedUpstreamCount: number;
  readonly publicBoundaryRefs: readonly string[];
  readonly publicBoundaryCount: number;
  readonly substantiveResponsibilityRefs: readonly string[];
  readonly substantiveResponsibilityCount: number;
  readonly materializationTargetRefs: readonly string[];
  readonly residualRefs: readonly string[];
}

export interface SdlcDecompositionSummary {
  readonly kind: "sdlc_decomposition_summary";
  readonly stageId: string;
  readonly upstreamKind: SdlcDecompositionUpstreamKind;
  readonly downstreamKind: SdlcDecompositionDownstreamKind;
  readonly thresholdProfileRef: string;
  readonly stageUpstreamUniverseRefs: readonly string[];
  readonly upstreamCount: number;
  readonly downstreamCount: number;
  readonly upstreamPerDownstreamRatio: number;
  readonly downstreamPerUpstreamRatio: number;
  readonly maxUpstreamPerDownstreamRatio: number;
  readonly maxDownstreamPerUpstream: number;
  readonly maxOwnedUpstreamPerDownstream: number;
  readonly maxOwnedUpstreamWithoutBoundary: number;
  readonly rows: readonly SdlcDecompositionSummaryRow[];
  readonly overloadedDownstreamIds: readonly string[];
  readonly explosionUpstreamRefs: readonly string[];
  readonly unownedDownstreamIds: readonly string[];
  readonly facadeDownstreamIds: readonly string[];
  readonly underDecomposedParentIds: readonly string[];
  readonly residualRefs: readonly string[];
  readonly residualOutsideSubsurfaceRefs: readonly string[];
  readonly invalidReferenceFields: readonly string[];
  readonly blockingReasons: readonly string[];
  readonly admissionDecision: SdlcDecompositionAdmissionDecision;
}

export interface SdlcDependencyMapNode {
  readonly nodeId: string;
  readonly predecessorNodeIds: readonly string[];
  readonly successorNodeIds: readonly string[];
  readonly ownedRequirementRefs: readonly string[];
  readonly materializationTargetRefs: readonly string[];
}

export interface SdlcModuleDependencyMap {
  readonly kind: "sdlc_module_dependency_map";
  readonly mapRef: string;
  readonly summaryRef: string;
  readonly nodes: readonly SdlcDependencyMapNode[];
  readonly steelThreadCandidateNodeIds: readonly string[];
  readonly parallelPartitionRefs: readonly string[];
  readonly cycleRefs: readonly string[];
}

export interface SdlcTestDependencyMap {
  readonly kind: "sdlc_test_dependency_map";
  readonly mapRef: string;
  readonly summaryRef: string;
  readonly nodes: readonly SdlcDependencyMapNode[];
  readonly steelThreadCandidateNodeIds: readonly string[];
  readonly parallelShardRefs: readonly string[];
  readonly cycleRefs: readonly string[];
}

export interface SdlcDependencyTraversalSelection {
  readonly kind: "sdlc_dependency_traversal_selection";
  readonly selectionRef: string;
  readonly dependencyMapRef: string;
  readonly dependencyMapKind:
    | SdlcModuleDependencyMap["kind"]
    | SdlcTestDependencyMap["kind"];
  readonly selectedMethod: SdlcDependencyTraversalMethod;
  readonly selectedNodeIds: readonly string[];
  readonly parallelGroupRefs: readonly string[];
  readonly blockingReasons: readonly string[];
  readonly basisRefs: readonly string[];
}

export interface SdlcFeatureDependencyDagEdge {
  readonly kind: "sdlc_feature_dependency_dag_edge";
  readonly fromNodeRef: string;
  readonly toNodeRef: string;
}

export interface SdlcFeatureDependencyDagNode {
  readonly kind: "sdlc_feature_dependency_dag_node";
  readonly nodeRef: string;
  readonly nodeKind: SdlcFeatureDependencyDagNodeKind;
  readonly edgeName: string;
  readonly ledgerRefs: readonly string[];
  readonly predecessorNodeRefs: readonly string[];
  readonly successorNodeRefs: readonly string[];
  readonly sourceAssetRefs: readonly string[];
  readonly targetAssetRefs: readonly string[];
  readonly readRefs: readonly string[];
  readonly writeTerritoryRefs: readonly string[];
  readonly outputAllocationRefs: readonly string[];
  readonly fanInRefs: readonly string[];
  readonly edgeAccountingRefs: readonly string[];
  readonly ownedRequirementRefs: readonly string[];
  readonly declaredPriority: number;
  readonly criticalPathCost: number;
}

export interface SdlcFeatureDependencyDag {
  readonly kind: "sdlc_feature_dependency_dag";
  readonly dagRef: string;
  readonly graphFunctionName: string;
  readonly traversalSelectionRef: string | null;
  readonly sourceDependencyMapRefs: readonly string[];
  readonly nodeRefs: readonly string[];
  readonly startNodes: readonly string[];
  readonly fanInNodeRefs: readonly string[];
  readonly topologicalOrder: readonly string[];
  readonly nodes: readonly SdlcFeatureDependencyDagNode[];
  readonly edges: readonly SdlcFeatureDependencyDagEdge[];
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcAbgFrontierCompilation {
  readonly kind: "sdlc_abg_frontier_compilation";
  readonly dagRef: string;
  readonly frontierRef: string;
  readonly startNodes: readonly string[];
  readonly branchRefs: readonly BranchRef[];
  readonly readyBranchRefs: readonly string[];
  readonly fanInBranchRefs: readonly string[];
  readonly declarations: readonly DependencyFrontierDeclaration[];
  readonly writeTerritoryConflictRefs: readonly string[];
  readonly outputAllocationConflictRefs: readonly string[];
  readonly conflictingBranchRefs: readonly string[];
  readonly basisRefs: readonly string[];
}

export interface SdlcTraversalComplexityThresholds {
  readonly kind: "sdlc_traversal_complexity_thresholds";
  readonly profileRef: string;
  readonly maxSingleHopInputObligations: number;
  readonly maxSingleHopOutputRows: number;
  readonly maxSingleHopUpstreamPerDownstreamRatio: number;
  readonly maxSingleHopDownstreamPerUpstreamRatio: number;
  readonly maxDualHopInputObligations: number;
  readonly maxDualHopOutputRows: number;
  readonly maxDualHopUpstreamPerDownstreamRatio: number;
  readonly maxDualHopDownstreamPerUpstreamRatio: number;
  readonly maxResidualRefsForSmallHop: number;
  readonly maxResidualOutsideSubsurfaceRefsForSmallHop: number;
}

export interface SdlcTraversalComplexityAssessment {
  readonly kind: "sdlc_traversal_complexity_assessment";
  readonly assessmentRef: string;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly thresholdProfileRef: string;
  readonly decompositionSummaryRef: string | null;
  readonly inputObligationCount: number;
  readonly outputRowCount: number;
  readonly upstreamPerDownstreamRatio: number;
  readonly downstreamPerUpstreamRatio: number;
  readonly maxOwnedInputsPerOutput: number;
  readonly residualRefCount: number;
  readonly residualOutsideSubsurfaceRefCount: number;
  readonly publicBoundaryCount: number;
  readonly substantiveDownstreamResponsibilityCount: number;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcOutcomeClassSelection {
  readonly kind: "sdlc_outcome_class_selection";
  readonly selectionRef: string;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly basisRefs: readonly string[];
  readonly blockingReasons: readonly string[];
  readonly admissionDecision: SdlcDecompositionAdmissionDecision;
}

export interface SdlcZoomAdmissionDecision {
  readonly kind: "sdlc_zoom_admission_decision";
  readonly disposition: SdlcZoomAdmissionDisposition;
  readonly reasonRefs: readonly string[];
  readonly selectedZoomStageRef: string | null;
}

export interface SdlcMinFpPressurePreservationDecision {
  readonly kind: "sdlc_min_fp_pressure_preservation_decision";
  readonly mechanism: SdlcMinFpPressurePreservationMechanism;
  readonly preservedPressureRefs: readonly string[];
  readonly skippedEdgeRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly admissionDecision: SdlcDecompositionAdmissionDecision;
  readonly blockingReasons: readonly string[];
}

export interface SdlcTraversalHopSelection {
  readonly kind: "sdlc_traversal_hop_selection";
  readonly selectionRef: string;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly hopClass: SdlcTraversalHopClass;
  readonly selectedGraphVariantRef: string;
  readonly complexityAssessment: SdlcTraversalComplexityAssessment;
  readonly zoomAdmission: SdlcZoomAdmissionDecision;
  readonly pressurePreservation: SdlcMinFpPressurePreservationDecision;
  readonly rejectedAlternativeRefs: readonly string[];
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export type SdlcComponentTestExecutionStatus =
  | "passed"
  | "failed"
  | "blocked"
  | "pending"
  | "unproven";

export interface SdlcComponentTestQualificationRow {
  readonly kind: "sdlc_component_test_qualification_row";
  readonly testClassId: string;
  readonly testcaseIds: readonly string[];
  readonly componentIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly status: SdlcComponentTestExecutionStatus;
  readonly evidenceRefs: readonly string[];
}

export const SDLC_COMPONENT_EXECUTION_FAILURE_KINDS = Object.freeze([
  "execution_evidence_missing",
  "execution_carrier_invalid",
  "execution_command_mismatch",
  "execution_shard_mismatch",
  "zero_tests_observed",
  "source_compile_error",
  "test_compile_error",
  "assertion_failure",
  "testcase_authority_contradiction",
  "runtime_exception",
  "worker_timeout_or_lost_terminal",
  "network_or_transport_failure",
  "triage_gap"
] as const);

export type SdlcComponentExecutionFailureKind =
  (typeof SDLC_COMPONENT_EXECUTION_FAILURE_KINDS)[number];

export const SDLC_COMPONENT_REPAIR_TARGETS = Object.freeze([
  "component_code",
  "component_test",
  "test_schedule",
  "test_execution_surface",
  "implementation_design",
  "testcase_authority",
  "requirement_reprice",
  "worker_archive",
  "transport_retry"
] as const);

export type SdlcComponentRepairTarget =
  (typeof SDLC_COMPONENT_REPAIR_TARGETS)[number];

export const SDLC_COMPONENT_ATTRIBUTION_CONFIDENCE = Object.freeze([
  "high",
  "medium",
  "low"
] as const);

export type SdlcComponentAttributionConfidence =
  (typeof SDLC_COMPONENT_ATTRIBUTION_CONFIDENCE)[number];

export interface SdlcComponentExecutionFailureRow {
  readonly kind: "sdlc_component_execution_failure_row";
  readonly failureId: string;
  readonly shardId: string;
  readonly moduleName: string;
  readonly testClassId: string;
  readonly testcaseIds: readonly string[];
  readonly componentIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly failureKind: SdlcComponentExecutionFailureKind;
  readonly repairTarget: SdlcComponentRepairTarget;
  readonly lawfulReentryPoint: string;
  readonly attributionConfidence: SdlcComponentAttributionConfidence;
  readonly sourceRefs: readonly string[];
  readonly testRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcComponentExecutionFailureRegister {
  readonly kind: "component_execution_failure_register";
  readonly registerVersion: "ts-component-depth-v1";
  readonly failureRows: readonly SdlcComponentExecutionFailureRow[];
}

export const SDLC_COMPONENT_REPAIR_SCHEDULE_STATUSES = Object.freeze([
  "repair_required",
  "no_repair_required",
  "triage_gap"
] as const);

export type SdlcComponentRepairScheduleStatus =
  (typeof SDLC_COMPONENT_REPAIR_SCHEDULE_STATUSES)[number];

export interface SdlcComponentRepairScheduleRow {
  readonly kind: "sdlc_component_repair_schedule_row";
  readonly scheduleId: string;
  readonly failureId: string;
  readonly repairTarget: SdlcComponentRepairTarget;
  readonly lawfulReentryPoint: string;
  readonly attributionConfidence: SdlcComponentAttributionConfidence;
  readonly testcaseIds: readonly string[];
  readonly componentIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly testRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcComponentRepairSchedule {
  readonly kind: "sdlc_component_repair_schedule";
  readonly registerVersion: "ts-component-depth-v1";
  readonly scheduleStatus: SdlcComponentRepairScheduleStatus;
  readonly repairRows: readonly SdlcComponentRepairScheduleRow[];
  readonly evidenceRefs: readonly string[];
}

export type SdlcReleaseDepthParityStatus = "met" | "blocked" | "repriced";

export interface SdlcReleaseDepthParityAssessment {
  readonly kind: "sdlc_release_depth_parity_assessment";
  readonly status: SdlcReleaseDepthParityStatus;
  readonly summary: string;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcComponentDepthRegister {
  readonly kind: "sdlc_component_depth_register";
  readonly registerVersion: "ts-component-depth-v1";
  readonly targetAssetType: string;
  readonly componentTopologyRows: readonly SdlcComponentTopologyRow[];
  readonly componentRealizationRows: readonly SdlcComponentRealizationRow[];
  readonly testComponentTopologyRows: readonly SdlcTestComponentTopologyRow[];
  readonly componentTestRows: readonly SdlcComponentTestRealizationRow[];
  readonly componentTestQualificationRows: readonly SdlcComponentTestQualificationRow[];
  readonly componentExecutionFailureRegister: SdlcComponentExecutionFailureRegister | null;
  readonly componentRepairSchedule: SdlcComponentRepairSchedule | null;
  readonly releaseDepthParity: SdlcReleaseDepthParityAssessment | null;
}

export type SdlcComponentDepthRegisterAdmissionStatus =
  | "admitted"
  | "rejected"
  | "not_required";

export interface SdlcComponentDepthRegisterAdmission {
  readonly kind: "sdlc_component_depth_register_admission";
  readonly status: SdlcComponentDepthRegisterAdmissionStatus;
  readonly targetAssetType: string;
  readonly register: SdlcComponentDepthRegister | null;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export const SDLC_TEST_CASE_KINDS = Object.freeze([
  "positive",
  "negative",
  "boundary",
  "integration",
  "uat",
  "regression"
] as const);

export type SdlcTestCaseKind = (typeof SDLC_TEST_CASE_KINDS)[number];

export const SDLC_TEST_EXECUTION_LANES = Object.freeze([
  "unit",
  "integration",
  "uat"
] as const);

export type SdlcTestExecutionLane =
  (typeof SDLC_TEST_EXECUTION_LANES)[number];

export interface SdlcDesignConsumptionContract {
  readonly kind: "sdlc_design_consumption_contract";
  readonly contractRef: string;
  readonly sourceDesignObligationRefs: readonly string[];
  readonly authorityBasisRefs: readonly string[];
  readonly consumerGraphFunctionRefs: readonly string[];
}

export interface SdlcImplementationDesignBinding {
  readonly kind: "sdlc_implementation_design_binding";
  readonly bindingRef: string;
  readonly implementationEvidenceRefs: readonly string[];
  readonly designConsumptionContractRefs: readonly string[];
  readonly sourceDesignObligationRefs: readonly string[];
}

export interface SdlcTestDesignBinding {
  readonly kind: "sdlc_test_design_binding";
  readonly bindingRef: string;
  readonly testEvidenceRefs: readonly string[];
  readonly designConsumptionContractRefs: readonly string[];
  readonly sourceDesignObligationRefs: readonly string[];
}

export interface SdlcTestCaseRow {
  readonly kind: "sdlc_test_case_row";
  readonly testCaseRef: string;
  readonly caseKind: SdlcTestCaseKind;
  readonly executionLane: SdlcTestExecutionLane;
  readonly sourceDesignObligationRefs: readonly string[];
  readonly testcaseAuthorityRefs: readonly string[];
  readonly expectedBehavior: string;
}

export interface SdlcTestDataBinding {
  readonly kind: "sdlc_test_data_binding";
  readonly testDataRef: string;
  readonly testCaseRef: string;
  readonly inputFixtureRefs: readonly string[];
  readonly generationPolicyRef: string;
  readonly expectedResultRef: string;
  readonly sourceDesignObligationRefs: readonly string[];
}

export interface SdlcExpectedResultBinding {
  readonly kind: "sdlc_expected_result_binding";
  readonly expectedResultRef: string;
  readonly testCaseRef: string;
  readonly assertionRefs: readonly string[];
  readonly expectedResultSummary: string;
  readonly verificationPolicyRef: string;
}

export interface SdlcTestStackProfileRow {
  readonly kind: "sdlc_test_stack_profile_row";
  readonly stackRef: string;
  readonly frameworkRef: string;
  readonly buildTool: string;
}

export interface SdlcTestModuleRow {
  readonly kind: "sdlc_test_module_row";
  readonly moduleName: string;
  readonly moduleRef: string;
  readonly testRoot: string;
}

export interface SdlcUatIntegrationBinding {
  readonly kind: "sdlc_uat_integration_binding";
  readonly uatTestCaseRef: string;
  readonly integrationTestCaseRef: string;
  readonly executionLane: SdlcTestExecutionLane;
}

export interface SdlcTestExecutionScheduleRow {
  readonly kind: "sdlc_test_execution_schedule_row";
  readonly scheduleRef: string;
  readonly testCaseRefs: readonly string[];
  readonly command: string;
  readonly frameworkRef: string;
  readonly shardId: string | null;
}

export interface SdlcTestDesignRegister {
  readonly kind: "sdlc_test_design_register";
  readonly registerVersion: "ts-test-design-v1";
  readonly targetAssetType: string;
  readonly designConsumptionRows: readonly SdlcDesignConsumptionContract[];
  readonly uatTestcaseRows: readonly SdlcTestCaseRow[];
  readonly testcaseAuthorityRows: readonly SdlcTestCaseRow[];
  readonly testStackProfileRows: readonly SdlcTestStackProfileRow[];
  readonly testModuleRows: readonly SdlcTestModuleRow[];
  readonly testComponentTopologyRows: readonly SdlcTestComponentTopologyRow[];
  readonly testDataBindings: readonly SdlcTestDataBinding[];
  readonly expectedResultBindings: readonly SdlcExpectedResultBinding[];
  readonly uatIntegrationBindings: readonly SdlcUatIntegrationBinding[];
  readonly testExecutionScheduleRows: readonly SdlcTestExecutionScheduleRow[];
}

export type SdlcTestDesignRegisterAdmissionStatus =
  | "admitted"
  | "rejected"
  | "not_required";

export interface SdlcTestDesignRegisterAdmission {
  readonly kind: "sdlc_test_design_register_admission";
  readonly status: SdlcTestDesignRegisterAdmissionStatus;
  readonly targetAssetType: string;
  readonly register: SdlcTestDesignRegister | null;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcTestExecutionPreparationRow {
  readonly kind: "sdlc_test_execution_preparation_row";
  readonly scheduleRef: string;
  readonly moduleName: string;
  readonly testClassId: string;
  readonly testcaseIds: readonly string[];
  readonly command: string;
  readonly workingDirectory: string;
  readonly frameworkRef: string;
  readonly shardId: string | null;
  readonly sourceTestFileRefs: readonly string[];
  readonly requirementIds: readonly string[];
  readonly status: "prepared" | "blocked" | "pending";
  readonly evidenceRefs: readonly string[];
}

export interface SdlcTestExecutionSurfaceRegister {
  readonly kind: "sdlc_test_execution_surface_register";
  readonly registerVersion: "ts-test-execution-v1";
  readonly targetAssetType: "test_execution_surface";
  readonly testExecutionPreparationRows: readonly SdlcTestExecutionPreparationRow[];
  readonly evidenceRefs: readonly string[];
  readonly summary: string | null;
}

export type SdlcTestExecutionSurfaceRegisterAdmissionStatus =
  | "admitted"
  | "rejected"
  | "not_required";

export interface SdlcTestExecutionSurfaceRegisterAdmission {
  readonly kind: "sdlc_test_execution_surface_register_admission";
  readonly status: SdlcTestExecutionSurfaceRegisterAdmissionStatus;
  readonly targetAssetType: string;
  readonly register: SdlcTestExecutionSurfaceRegister | null;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcTestExecutionEvidenceAdmission {
  readonly kind: "sdlc_test_execution_evidence_admission";
  readonly admissionRef: string;
  readonly testExecutionSurfaceRef: string;
  readonly declaredFrameworkRef: string;
  readonly declaredCommand: string;
  readonly observedResultRef: string;
  readonly status: SdlcWorkerExecutionEvidence["status"];
  readonly testsObserved: number;
  readonly reportRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcTestResultVerificationRow {
  readonly kind: "sdlc_test_result_verification_row";
  readonly verificationRef: string;
  readonly testCaseRef: string;
  readonly expectedResultRef: string;
  readonly observedResultRef: string;
  readonly status: "passed" | "failed" | "blocked";
  readonly evidenceRefs: readonly string[];
}

export interface SdlcCoAffirmationLedger {
  readonly kind: "sdlc_co_affirmation_ledger";
  readonly ledgerRef: string;
  readonly ledgerVersionRef: string;
  readonly designObligationRefs: readonly string[];
  readonly implementationEvidenceRefs: readonly string[];
  readonly testEvidenceRefs: readonly string[];
  readonly executionEvidenceRefs: readonly string[];
  readonly verificationRefs: readonly string[];
  readonly testcaseRefs: readonly string[];
  readonly status: "coaffirmed" | "blocked";
  readonly residualPressureRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

export const SDLC_DOMAIN_ENTITY_OWNERSHIP = Object.freeze([
  "owned",
  "referenced"
] as const);

export type SdlcDomainEntityOwnership =
  (typeof SDLC_DOMAIN_ENTITY_OWNERSHIP)[number];

export const SDLC_DOMAIN_ATTRIBUTE_CARDINALITIES = Object.freeze([
  "one",
  "optional",
  "many"
] as const);

export type SdlcDomainAttributeCardinality =
  (typeof SDLC_DOMAIN_ATTRIBUTE_CARDINALITIES)[number];

export interface SdlcDomainAttribute {
  readonly kind: "sdlc_domain_attribute";
  readonly attributeId: string;
  readonly name: string;
  readonly valueType: string;
  readonly cardinality: SdlcDomainAttributeCardinality;
  readonly invariantRefs: readonly string[];
}

export interface SdlcDomainEntity {
  readonly kind: "sdlc_domain_entity";
  readonly entityId: string;
  readonly moduleName: string;
  readonly ownership: SdlcDomainEntityOwnership;
  readonly attributes: readonly SdlcDomainAttribute[];
  readonly invariants: readonly string[];
  readonly sourceAssetRefs: readonly string[];
}

export interface SdlcDomainOperation {
  readonly kind: "sdlc_domain_operation";
  readonly operationId: string;
  readonly moduleName: string;
  readonly inputEntityIds: readonly string[];
  readonly outputEntityIds: readonly string[];
  readonly requiredAttributeIds: readonly string[];
}

export interface SdlcModuleSchemaFragment {
  readonly kind: "sdlc_module_schema_fragment";
  readonly moduleName: string;
  readonly entities: readonly SdlcDomainEntity[];
  readonly operations: readonly SdlcDomainOperation[];
  readonly requirementIds: readonly string[];
  readonly sourceAssetRefs: readonly string[];
}

export interface SdlcEntityStateTransition {
  readonly kind: "sdlc_entity_state_transition";
  readonly transitionId: string;
  readonly fromState: string;
  readonly toState: string;
  readonly operationId: string;
  readonly entityId: string;
}

export interface SdlcModuleStateDiagramFragment {
  readonly kind: "sdlc_module_state_diagram_fragment";
  readonly moduleName: string;
  readonly entityId: string;
  readonly stateless: boolean;
  readonly states: readonly string[];
  readonly transitions: readonly SdlcEntityStateTransition[];
  readonly requirementIds: readonly string[];
  readonly sourceAssetRefs: readonly string[];
}

export interface SdlcAggregateDomainEntity {
  readonly kind: "sdlc_aggregate_domain_entity";
  readonly entityId: string;
  readonly ownerModuleName: string;
  readonly attributes: readonly SdlcDomainAttribute[];
  readonly sourceModuleNames: readonly string[];
}

export interface SdlcAggregateDomainModel {
  readonly kind: "sdlc_aggregate_domain_model";
  readonly modelVersion: "ts-design-depth-v1";
  readonly entities: readonly SdlcAggregateDomainEntity[];
  readonly operations: readonly SdlcDomainOperation[];
  readonly crossModuleReferences: readonly {
    readonly fromModuleName: string;
    readonly toModuleName: string;
    readonly entityId: string;
  }[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcSunnyDaySequenceStep {
  readonly kind: "sdlc_sunny_day_sequence_step";
  readonly stepId: string;
  readonly moduleName: string;
  readonly operationId: string;
  readonly inputEntityIds: readonly string[];
  readonly outputEntityIds: readonly string[];
  readonly stateTransitionIds: readonly string[];
}

export interface SdlcAggregateSunnyDaySequence {
  readonly kind: "sdlc_aggregate_sunny_day_sequence";
  readonly sequenceVersion: "ts-design-depth-v1";
  readonly steps: readonly SdlcSunnyDaySequenceStep[];
  readonly evidenceRefs: readonly string[];
}

export const SDLC_DESIGN_COMPLETENESS_AXES = Object.freeze([
  "entity",
  "attribute",
  "flow"
] as const);

export type SdlcDesignCompletenessAxis =
  (typeof SDLC_DESIGN_COMPLETENESS_AXES)[number];

export const SDLC_DESIGN_COMPLETENESS_STATUSES = Object.freeze([
  "satisfied",
  "partial",
  "blocked"
] as const);

export type SdlcDesignCompletenessStatus =
  (typeof SDLC_DESIGN_COMPLETENESS_STATUSES)[number];

export interface SdlcDesignCompletenessAxisVerdict {
  readonly kind: "sdlc_design_completeness_axis_verdict";
  readonly axis: SdlcDesignCompletenessAxis;
  readonly status: SdlcDesignCompletenessStatus;
  readonly reasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcDesignCompletenessVerdict {
  readonly kind: "sdlc_design_completeness_verdict";
  readonly verdictVersion: "ts-design-depth-v1";
  readonly entity: SdlcDesignCompletenessAxisVerdict;
  readonly attribute: SdlcDesignCompletenessAxisVerdict;
  readonly flow: SdlcDesignCompletenessAxisVerdict;
}

export interface SdlcImplementationStackProfileRow {
  readonly kind: "sdlc_stack_profile_row";
  readonly stackRef: string;
  readonly language: string;
  readonly buildTool: string;
}

export interface SdlcImplementationModuleRow {
  readonly kind: "sdlc_implementation_module_row";
  readonly moduleName: string;
  readonly moduleRef: string;
}

export interface SdlcAggregateDomainModelRow {
  readonly kind: "sdlc_aggregate_domain_model_row";
  readonly modelRef: string;
}

export interface SdlcSunnyDaySequenceRow {
  readonly kind: "sdlc_sunny_day_sequence_row";
  readonly sequenceRef: string;
}

export interface SdlcFileTargetRow {
  readonly kind: "sdlc_file_target_row";
  readonly relativePath: string;
  readonly role: string;
}

export interface SdlcDesignDepthRegister {
  readonly kind: "sdlc_design_depth_register";
  readonly registerVersion: "ts-design-depth-v1";
  readonly targetAssetType: string;
  readonly stackProfileRows: readonly SdlcImplementationStackProfileRow[];
  readonly implementationModuleRows: readonly SdlcImplementationModuleRow[];
  readonly aggregateDomainModelRows: readonly SdlcAggregateDomainModelRow[];
  readonly moduleSchemaFragments: readonly SdlcModuleSchemaFragment[];
  readonly moduleStateDiagramFragments: readonly SdlcModuleStateDiagramFragment[];
  readonly aggregateDomainModel: SdlcAggregateDomainModel | null;
  readonly sunnyDaySequenceRows: readonly SdlcSunnyDaySequenceRow[];
  readonly aggregateSunnyDaySequence: SdlcAggregateSunnyDaySequence | null;
  readonly componentTopologyRows: readonly SdlcComponentTopologyRow[];
  readonly componentRealizationRows: readonly SdlcComponentRealizationRow[];
  readonly fileTargetRows: readonly SdlcFileTargetRow[];
  readonly designCompletenessVerdict: SdlcDesignCompletenessVerdict | null;
}

export type SdlcDesignDepthRegisterAdmissionStatus =
  | "admitted"
  | "rejected"
  | "not_required";

export interface SdlcDesignDepthRegisterAdmission {
  readonly kind: "sdlc_design_depth_register_admission";
  readonly status: SdlcDesignDepthRegisterAdmissionStatus;
  readonly targetAssetType: string;
  readonly register: SdlcDesignDepthRegister | null;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcWorkerExecutionEvidence {
  readonly kind: "sdlc_worker_execution_evidence";
  readonly lane: "build" | "test";
  readonly command: string;
  readonly status: "succeeded" | "failed" | "pending";
  readonly reportRefs: readonly string[];
  readonly testsObserved: number | null;
  readonly passedCount: number | null;
  readonly failedCount: number | null;
  readonly shardEvidence: readonly SdlcWorkerExecutionShardEvidence[];
}

export interface SdlcWorkerExecutionShardEvidence {
  readonly kind: "sdlc_worker_execution_shard_evidence";
  readonly shardId: string;
  readonly moduleName: string;
  readonly lane: "test";
  readonly command: string;
  readonly status: "succeeded" | "failed" | "pending";
  readonly reportRefs: readonly string[];
  readonly testsObserved: number | null;
  readonly passedCount: number | null;
  readonly failedCount: number | null;
}

export type SdlcComputeSubworkstreamStageRef = "transform.C" | "evaluate.C";

export type SdlcComputeSubworkstreamStatus =
  | "not_started"
  | "running"
  | "done"
  | "blocked"
  | "failed"
  | "discarded";

export type SdlcComputeSubworkstreamMergeDisposition =
  | "not_started"
  | "merged"
  | "merged_with_conflicts"
  | "blocked"
  | "failed"
  | "discarded"
  | "not_applicable";

export interface SdlcComputeSubworkstreamRow {
  readonly kind: "sdlc_compute_subworkstream_row";
  readonly workstreamRef: string;
  readonly stageRef: SdlcComputeSubworkstreamStageRef;
  readonly selectedEdgeRef: string;
  readonly targetCarrierRef: string;
  readonly targetModuleRef: string | null;
  readonly targetInterfaceRef: string | null;
  readonly predecessorWorkstreamRefs: readonly string[];
  readonly dependencyInputRefs: readonly string[];
  readonly authorityInputRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly readRefs: readonly string[];
  readonly writeTerritoryRefs: readonly string[];
  readonly outputAllocationRefs: readonly string[];
  readonly idempotencyKey: string;
  readonly fanInScopeRef: string | null;
  readonly changedFileRefs: readonly string[];
  readonly proposedFileRefs: readonly string[];
  readonly status: SdlcComputeSubworkstreamStatus;
  readonly blockingReasonRefs: readonly string[];
  readonly residualGapRefs: readonly string[];
  readonly mergeDisposition: SdlcComputeSubworkstreamMergeDisposition;
}

export interface SdlcComputeSubworkstreamMergeResult {
  readonly kind: "sdlc_compute_subworkstream_merge_result";
  readonly mergedOutputRefs: readonly string[];
  readonly conflictRefs: readonly string[];
  readonly discardedOutputRefs: readonly string[];
  readonly carryForwardGapRefs: readonly string[];
  readonly parentResultRef: string | null;
}

export interface SdlcComputeSubworkstreamManifest {
  readonly kind: "sdlc_compute_subworkstream_manifest";
  readonly manifestVersion: "ts-compute-subworkstream-v1";
  readonly phase: "phase_1_parent_agent_internal";
  readonly authority: "observation_only_parent_plugin_result";
  readonly stageRef: SdlcComputeSubworkstreamStageRef;
  readonly selectedEdgeRef: string;
  readonly targetCarrierRef: string;
  readonly source:
    | "system_default"
    | "parent_transform_report"
    | "parent_evaluate_report"
    | "parent_checkpoint";
  readonly subworkstreams: readonly SdlcComputeSubworkstreamRow[];
  readonly mergeResult: SdlcComputeSubworkstreamMergeResult;
  readonly nonAuthority: true;
  readonly abgDistributedExecutionClaim: false;
}

export interface SdlcComputeSubworkstreamPolicy {
  readonly kind: "sdlc_compute_subworkstream_policy";
  readonly policyVersion: "ts-compute-subworkstream-policy-v1";
  readonly phase: "phase_1_parent_agent_internal";
  readonly stageRef: SdlcComputeSubworkstreamStageRef;
  readonly permission:
    "agent_internal_subworkstreams_permitted_with_parent_merge";
  readonly selectedEdgeRef: string;
  readonly targetCarrierRef: string;
  readonly manifestPath: string;
  readonly manifestRef: string;
  readonly derivationBasisRefs: readonly string[];
  readonly authorityInputRefs: readonly string[];
  readonly dependencyInputRefs: readonly string[];
  readonly allowedWriteRoots: readonly string[];
  readonly requiredRowFields: readonly string[];
  readonly nonAuthorityRules: readonly string[];
}

export type SdlcTraversalObligationKind =
  | "requirement"
  | "source_asset"
  | "target_asset"
  | "evaluator"
  | "design_or_module"
  | "prior_gap"
  | "runtime_context";

export interface SdlcTraversalObligation {
  readonly kind: "sdlc_traversal_obligation";
  readonly obligationId: string;
  readonly obligationKind: SdlcTraversalObligationKind;
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
  readonly payload: SdlcTraversalObligationPayload;
}

export type SdlcTraversalObligationPayloadStatus =
  | "concrete"
  | "structural"
  | "reference_only";

export interface SdlcTraversalObligationPayload {
  readonly kind: "sdlc_traversal_obligation_payload";
  readonly status: SdlcTraversalObligationPayloadStatus;
  readonly sourceRefs: readonly string[];
  readonly sourceDigests: readonly string[];
  readonly sourceSnippets: readonly string[];
  readonly coverageExpectation: string;
}

export interface SdlcTraversalObligationDeltaSummary {
  readonly kind: "sdlc_traversal_obligation_delta_summary";
  readonly obligationCount: number;
  readonly requirementCount: number;
  readonly priorGapCount: number;
  readonly authorityRefCount: number;
}

export type SdlcAuthorityIndexCategory =
  | "intent"
  | "product"
  | "goals"
  | "requirements"
  | "design"
  | "modules"
  | "context"
  | "runtime"
  | "other";

export interface SdlcAuthorityIndexEntry {
  readonly kind: "sdlc_authority_index_entry";
  readonly key: string;
  readonly ref: string;
  readonly category: SdlcAuthorityIndexCategory;
  readonly title: string;
  readonly digest: string;
  readonly tags: readonly string[];
}

export interface SdlcRetrievalHint {
  readonly kind: "sdlc_retrieval_hint";
  readonly key: string;
  readonly ref: string;
  readonly reason: string;
  readonly obligationIds: readonly string[];
}

export interface SdlcTraversalObligationContext {
  readonly kind: "sdlc_traversal_obligation_context";
  readonly edgeAssuranceContractRef?: string;
  readonly edgeAssuranceContractDigest?: string;
  readonly targetCarrierContractRef?: string;
  readonly targetCarrierContractDigest?: string;
  readonly requiredSourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly obligations: readonly SdlcTraversalObligation[];
  readonly authorityRefs: readonly string[];
  readonly authorityIndex: readonly SdlcAuthorityIndexEntry[];
  readonly trancheKeys: readonly string[];
  readonly retrievalHints: readonly SdlcRetrievalHint[];
  readonly runtimeContextRefs: readonly string[];
  readonly priorEdgeRefs: readonly string[];
  readonly deltaSummary: SdlcTraversalObligationDeltaSummary;
}

export type SdlcTraversalStrategy =
  | "full_breadth"
  | "steel_thread"
  | "targeted_repair";

export type SdlcTraversalStrategyDecisionSource =
  | "abg_selected"
  | "proportionality_selection"
  | "retry_backoff"
  | "odd_sdlc_fallback_plan";

export interface SdlcTraversalStrategyPlan {
  readonly kind: "sdlc_traversal_strategy_plan";
  readonly planVersion: "ts-strategy-plan-v1";
  readonly planRef: string;
  readonly defaultStrategy: SdlcTraversalStrategy;
  readonly edgeStrategies: Readonly<Record<string, SdlcTraversalStrategy>>;
  readonly edgeScopeRefs?: Readonly<Record<string, readonly string[]>>;
}

export interface SdlcTraversalStrategyDecision {
  readonly kind: "sdlc_traversal_strategy_decision";
  readonly decisionVersion: "ts-strategy-decision-v1";
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly selectedStrategy: SdlcTraversalStrategy;
  readonly decisionSource: SdlcTraversalStrategyDecisionSource;
  readonly strategyPlanRef: string;
  readonly strategyDirectiveRef: string | null;
  readonly featureScopeRequired: boolean;
  readonly featureScopeDerived: boolean;
  readonly basisRefs: readonly string[];
}

export type SdlcFeatureScopeMode =
  | "steel_thread"
  | "targeted_repair"
  | "full_breadth";

export interface SdlcFeatureScope {
  readonly kind: "sdlc_feature_scope";
  readonly scopeVersion: "ts-scope-v1";
  readonly mode: SdlcFeatureScopeMode;
  readonly scopeRef: string;
  readonly basisRefs: readonly string[];
  readonly includedRequirementRefs: readonly string[];
  readonly includedModuleNames: readonly string[];
  readonly includedEntityIds: readonly string[];
  readonly includedOperationIds: readonly string[];
  readonly deferredModuleNames: readonly string[];
}

export type SdlcWorkerObligationFulfillmentStatus =
  | "fulfilled"
  | "partial"
  | "blocked"
  | "unassessed";

export const SDLC_REVIEW_GRADE_FAILURE_CLASSES = Object.freeze([
  "trace_missing",
  "semantic_not_realized",
  "boundary_collapsed",
  "wrong_stage",
  "schema_invalid",
  "execution_environment",
  "test_overlap_missing"
] as const);

export type SdlcReviewGradeFailureClass =
  (typeof SDLC_REVIEW_GRADE_FAILURE_CLASSES)[number];

export const SDLC_REPAIR_SURFACE_TRIAGE_DISPOSITIONS = Object.freeze([
  "current_edge_repair",
  "upstream_reentry",
  "downstream_deferred",
  "external_blocked"
] as const);

export type SdlcRepairSurfaceTriageDisposition =
  (typeof SDLC_REPAIR_SURFACE_TRIAGE_DISPOSITIONS)[number];

export interface SdlcRepairSurfaceTriageCarrier {
  readonly kind: "sdlc_repair_surface_triage";
  readonly disposition: SdlcRepairSurfaceTriageDisposition;
  readonly repairGraphFunctionRef: string | null;
  readonly repairGraphVectorRef: string | null;
  readonly repairAssetRef: string | null;
  readonly evidenceRefs: readonly string[];
  readonly rationale: string;
}

export interface SdlcWorkerObligationAssessment {
  readonly kind: "sdlc_worker_obligation_assessment";
  readonly obligationId: string;
  readonly fulfillmentStatus: SdlcWorkerObligationFulfillmentStatus;
  readonly evidenceRefs: readonly string[];
  readonly blockingReasons: readonly string[];
  readonly reviewGrade?: boolean | undefined;
  readonly reviewFailureClass?: SdlcReviewGradeFailureClass | null | undefined;
  readonly requiredAction?: string | null | undefined;
  readonly semanticEvidenceRefs?: readonly string[] | undefined;
  readonly acceptedAuthorityRefs?: readonly string[] | undefined;
  readonly fulfillmentBinding?: GtlContractFulfillmentBinding | null | undefined;
  readonly repairSurfaceTriage?: SdlcRepairSurfaceTriageCarrier | null | undefined;
}

export type SdlcRequirementFunctionFulfillmentBinding =
  GtlContractFulfillmentBinding;

export interface SdlcReviewGradeObligationFinding {
  readonly kind: "sdlc_review_grade_obligation_finding";
  readonly obligationId: string;
  readonly fulfillmentStatus: SdlcWorkerObligationFulfillmentStatus;
  readonly failureClass: SdlcReviewGradeFailureClass | null;
  readonly requiredAction: string | null;
  readonly evidenceRefs: readonly string[];
  readonly acceptedAuthorityRefs: readonly string[];
  readonly fulfillmentBinding: GtlContractFulfillmentBinding | null;
  readonly repairSurfaceTriage?: SdlcRepairSurfaceTriageCarrier | null | undefined;
  readonly rationale: string;
}

export interface SdlcReviewGradeDimensionObservation {
  readonly dimension: string;
  readonly status: string;
  readonly rationale: string;
}

export interface SdlcReviewGradeObligationCoverageFold {
  readonly dimension: string;
  readonly coveredCount: number;
  readonly totalCount: number;
  readonly status: string;
  readonly rationale: string;
}

export interface SdlcReviewGradeEdgeFulfillmentAssessment {
  readonly kind: "sdlc_review_grade_edge_fulfillment_assessment";
  readonly assessmentVersion: "ts-review-grade-v1";
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly status: "passed" | "blocked";
  readonly reviewedObligationIds: readonly string[];
  readonly findings: readonly SdlcReviewGradeObligationFinding[];
  readonly stageBoundaryConformance: SdlcReviewGradeDimensionObservation | null;
  readonly materializationBindingRelation: SdlcReviewGradeDimensionObservation | null;
  readonly obligationCoverageFold: SdlcReviewGradeObligationCoverageFold | null;
  readonly evidenceRefs: readonly string[];
  readonly summary: string;
}

export interface SdlcReviewGradeEdgeFulfillmentAdmission {
  readonly kind: "sdlc_review_grade_edge_fulfillment_admission";
  readonly status: "admitted" | "rejected" | "not_required";
  readonly targetAssetType: string;
  readonly assessment: SdlcReviewGradeEdgeFulfillmentAssessment | null;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export type SdlcPostflightGapReasonClass =
  | "contract_violation"
  | "authority_to_code"
  | "code_to_test"
  | "missing_evidence"
  | "worker_unresolved"
  | "topology"
  | "target_resolution"
  | "worker_runtime"
  | "runtime_policy"
  | "install"
  | "assurance"
  | "unknown";

export interface SdlcPostflightGapReason {
  readonly kind: "sdlc_postflight_gap_reason";
  readonly reason: string;
  readonly reasonClass: SdlcPostflightGapReasonClass;
  readonly blockingReason: SdlcBlockingReason;
}

export interface SdlcPostflightGapDossier {
  readonly kind: "sdlc_postflight_gap_dossier";
  readonly status: "open";
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly targetAssetType: string;
  readonly reasons: readonly SdlcPostflightGapReason[];
  readonly evidenceRefs: readonly string[];
  readonly priorManifestId: string;
  readonly currentGapDossierRef: string;
  readonly retryEligible: boolean;
  readonly nextLawfulActions: readonly (
    | "retry_same_edge"
    | "escalate_to_fp"
    | "repair_worker_output"
    | "triage_gap"
    | "reprice_requirement_or_design"
  )[];
}

export interface SdlcWorkerRetryContext {
  readonly kind: "sdlc_worker_retry_context";
  readonly retryAttemptRefs: readonly {
    readonly vectorIndex: number;
    readonly retryRunId: string;
    readonly retryCallId: string;
    readonly manifestId: string;
    readonly priorAuthorityRef: string;
    readonly attemptIndex: number;
    readonly sourceProjectionRef: string;
  }[];
  readonly priorGapDossiers: readonly SdlcPostflightGapDossier[];
}

export interface SdlcTraversalIntentPackage {
  readonly kind: "sdlc_traversal_intent_package";
  readonly packageVersion: "ts-intent-v1";
  readonly ticketExecutionContract?: SdlcTicketExecutionContract | null;
  readonly overlayRef: string | null;
  readonly overlayBindingRef: string | null;
  readonly graphCatalogDigestRef: string | null;
  readonly overlayAnnotationRefs: readonly string[];
  readonly overlayZoomGraphFunctionRefs: readonly string[];
  readonly overlayZoomTargetGraphFunctionRefs: readonly string[];
  readonly edgeAssuranceContractRef?: string;
  readonly edgeAssuranceContractDigest?: string;
  readonly targetCarrierContractRef?: string;
  readonly targetCarrierContractDigest?: string;
  readonly targetCarrierProjection: SdlcWorkerTargetCarrierProjection;
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly methodRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly runtimeContextRefs: readonly string[];
  readonly priorEdgeRefs: readonly string[];
  readonly retryAttemptRefs: readonly string[];
  readonly priorGapDossierRefs: readonly string[];
  readonly obligationIds: readonly string[];
  readonly obligationDeltaSummary: SdlcTraversalObligationDeltaSummary;
  readonly traversalStrategyDecision: SdlcTraversalStrategyDecision;
  readonly featureScope: SdlcFeatureScope;
  readonly productMaterialization: SdlcProductMaterializationContract;
  readonly resultReportSchema: readonly string[];
  readonly evaluatorExpectations: SdlcHookTransformProfile;
  readonly outputFile: string;
  readonly reportFile: string;
  readonly packageDigest: string;
}

export interface SdlcWorkerInvocationObligation {
  readonly kind: "sdlc_worker_invocation_obligation";
  readonly obligationId: string;
  readonly obligationKind: SdlcTraversalObligationKind;
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly sourceSnippetCount: number;
  readonly coverageExpectation: string;
}

export interface SdlcWorkerInvocationRetryFrontier {
  readonly kind: "sdlc_worker_invocation_retry_frontier";
  readonly retryAttemptRefs: readonly string[];
  readonly dossierRefs: readonly string[];
  readonly reasonCount: number;
  readonly sampleReasonCodes: readonly string[];
  readonly omittedReasonCount: number;
}

export type SdlcWorkerRetryRepairScope =
  | "schema_local"
  | "semantic_local"
  | "broad_regeneration";

export interface SdlcWorkerRetryRepairInstruction {
  readonly kind: "sdlc_worker_retry_repair_instruction";
  readonly repairScope: SdlcWorkerRetryRepairScope;
  readonly gapDossierRef: string;
  readonly reason: string;
  readonly reasonClass: SdlcPostflightGapReasonClass;
  readonly blockingReasonCode: string;
  readonly blockingReasonDetail: string;
  readonly rejectedArtifactRefs: readonly string[];
  readonly acceptedCarrierSchemaRef: string | null;
  readonly acceptedCarrierFieldSet: readonly string[];
  readonly repairReentryPlanId: string | null;
  readonly nonClosureRules: readonly string[];
}

export interface SdlcComponentRepairReentryPlan {
  readonly kind: "sdlc_component_repair_reentry_plan";
  readonly planVersion: "ts-component-repair-reentry-v1";
  readonly planId: string;
  readonly sourceGapDossierRef: string;
  readonly sourceEdgeName: string;
  readonly sourceTargetAssetType: string;
  readonly reason: string;
  readonly targetEdgeName: string;
  readonly targetAssetType: string;
  readonly repairTarget: SdlcComponentRepairTarget;
  readonly failureId: string;
  readonly scheduleId: string;
  readonly testcaseIds: readonly string[];
  readonly componentIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly testRefs: readonly string[];
  readonly repairRowEvidenceRefs: readonly string[];
  readonly diagnosticEvidenceRefs: readonly string[];
  readonly diagnosticExcerpt: string;
  readonly acceptedCarrierSchemaRef: string;
  readonly acceptedCarrierFieldSet: readonly string[];
  readonly noBroadRegeneration: true;
}

export interface SdlcWorkerInvocationOutputContract {
  readonly kind: "sdlc_worker_invocation_output_contract";
  readonly outputFile: string;
  readonly reportFile: string;
  readonly subworkstreamManifestFile: string;
  readonly fpTransformRequestFile: string;
  readonly fpTransformResultFile: string;
  readonly fpEvaluateResultFile: string;
  readonly materializationRequired: boolean;
  readonly tenantRoot: string;
  readonly selectedOutputRoot: string;
  readonly declaredProductFileTargets: readonly string[];
  readonly declaredProductTargetContracts: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly requiredRoles: readonly SdlcMaterializedProductFileRole[];
  readonly buildExecutionContract: string;
  readonly testExecutionContract: string;
}

export interface SdlcWorkerTargetCarrierObjectTemplate {
  readonly kind: "sdlc_worker_target_carrier_object_template";
  readonly templateRef: string;
  readonly closed: true;
  readonly requiredFields: readonly string[];
  readonly fieldTypes: Readonly<Record<string, string>>;
  readonly enumDomains: Readonly<Record<string, readonly string[]>>;
  readonly example: Readonly<Record<string, unknown>>;
}

export interface SdlcWorkerTargetCarrierConstructionTemplate {
  readonly kind: "sdlc_worker_target_carrier_construction_template";
  readonly templateRef: string;
  readonly targetAssetType: string;
  readonly carrierKind: string;
  readonly nestedPayloadPath: string;
  readonly carrierEnvelope: SdlcWorkerTargetCarrierObjectTemplate;
  readonly payloadTemplate: SdlcWorkerTargetCarrierObjectTemplate | null;
  readonly rowTemplates: readonly SdlcWorkerTargetCarrierObjectTemplate[];
}

export interface SdlcWorkerTargetCarrierProjection {
  readonly kind: "sdlc_worker_target_carrier_projection";
  readonly targetCarrierContractRef: string;
  readonly targetCarrierContractDigest: string;
  readonly targetCarrierTemplateRef: string;
  readonly constructionDepthRole:
    | "none"
    | "staged_authority_producer"
    | "staged_materialization_consumer";
  readonly producedStagedAuthorityRefs: readonly string[];
  readonly requiredStagedAuthorityRefs: readonly string[];
  readonly outputCarrierKind: string;
  readonly nestedPayloadPath: string;
  readonly requiredFieldRefs: readonly string[];
  readonly fixedProtocolFieldRefs: readonly string[];
  readonly workerFillableFieldRefs: readonly string[];
  readonly literalDomainRefs: readonly string[];
  readonly schemaRef: string;
  readonly handoffProjectionRef: string;
  readonly constructionTemplateRef: string;
  readonly constructionTemplate: SdlcWorkerTargetCarrierConstructionTemplate;
  readonly closurePreconditionRef: string;
  readonly testCaseGenerationRef: string;
}

export interface SdlcWorkerTargetCarrierPromptProjection {
  readonly kind: "sdlc_worker_target_carrier_prompt_projection";
  readonly targetCarrierContractRef: string;
  readonly targetCarrierContractDigest: string;
  readonly targetCarrierTemplateRef: string;
  readonly constructionDepthRole:
    | "none"
    | "staged_authority_producer"
    | "staged_materialization_consumer";
  readonly producedStagedAuthorityRefs: readonly string[];
  readonly requiredStagedAuthorityRefs: readonly string[];
  readonly outputCarrierKind: string;
  readonly nestedPayloadPath: string;
  readonly requiredFieldRefs: readonly string[];
  readonly fixedProtocolFieldRefs: readonly string[];
  readonly workerFillableFieldRefs: readonly string[];
  readonly literalDomainRefs: readonly string[];
  readonly schemaRef: string;
  readonly handoffProjectionRef: string;
  readonly constructionTemplateRef: string;
  readonly closurePreconditionRef: string;
  readonly testCaseGenerationRef: string;
}

export interface SdlcProductMaterializationAuthorityTarget {
  readonly kind: "sdlc_product_materialization_authority_target";
  readonly path: string;
  readonly targetKind: "file" | "directory";
  readonly requiredRole: SdlcMaterializedProductFileRole;
  readonly policyRef: string;
  readonly source:
    | "context_expected_files"
    | "design_asset_authority"
    | "product_authority"
    | "requirement_authority"
    | "tenant_stack_authority";
  readonly sourceRef: string;
}

export interface SdlcProductMaterializationAuthorityReconciliation {
  readonly kind: "sdlc_product_materialization_authority_reconciliation";
  readonly status: "not_required" | "passed" | "missing" | "ambiguous";
  readonly selectedOutputRoot: string;
  readonly contextExpectedFileTargets: readonly string[];
  readonly designAssetAuthorityTargets: readonly string[];
  readonly tenantStackAuthorityTargets: readonly string[];
  readonly requirementAuthorityTargets: readonly string[];
  readonly productAuthorityTargets: readonly string[];
  readonly declaredProductFileTargets: readonly string[];
  readonly contextExpectedTargetContracts: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly designAssetAuthorityTargetContracts: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly tenantStackAuthorityTargetContracts: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly requirementAuthorityTargetContracts: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly productAuthorityTargetContracts: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly declaredProductTargetContracts: readonly SdlcProductMaterializationAuthorityTarget[];
  readonly sourceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}

export interface SdlcWorkerInvocationPackage {
  readonly kind: "sdlc_worker_invocation_package";
  readonly packageVersion: "ts-invocation-v1";
  readonly edgeAssuranceContractRef?: string;
  readonly edgeAssuranceContractDigest?: string;
  readonly targetCarrierContractRef?: string;
  readonly targetCarrierContractDigest?: string;
  readonly targetCarrierProjection: SdlcWorkerTargetCarrierPromptProjection;
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly workCategoryGovernance: SdlcWorkerWorkCategoryGovernanceSelection;
  readonly manifestPath: string;
  readonly manifestRef: string;
  readonly manifestDigest: string;
  readonly traversalIntentPackagePath: string;
  readonly traversalIntentPackageRef: string;
  readonly traversalIntentPackageDigest: string;
  readonly transformAxioms: readonly string[];
  readonly outcomeDirectives: readonly string[];
  readonly computeSubworkstreamPolicy: SdlcComputeSubworkstreamPolicy;
  readonly outputContract: SdlcWorkerInvocationOutputContract;
  readonly productMaterializationAuthority: SdlcProductMaterializationAuthorityReconciliation;
  readonly allowedWriteRoots: readonly string[];
  readonly traversalStrategyDecision: SdlcTraversalStrategyDecision;
  readonly featureScope: SdlcFeatureScope;
  readonly retryFrontier: SdlcWorkerInvocationRetryFrontier;
  readonly repairReentryPlans: readonly SdlcComponentRepairReentryPlan[];
  readonly retryRepairInstructions: readonly SdlcWorkerRetryRepairInstruction[];
  readonly inlineObligations: readonly SdlcWorkerInvocationObligation[];
  readonly inlineObligationIds: readonly string[];
  readonly requirementTraceObligationIds: readonly string[];
  readonly omittedRequirementTraceObligationCount: number;
  readonly trancheKeys: readonly string[];
  readonly omittedObligationCount: number;
  readonly retrievalHints: readonly SdlcRetrievalHint[];
  readonly obligationDeltaSummary: SdlcTraversalObligationDeltaSummary;
  readonly authorityRefCount: number;
  readonly runtimeContextRefs: readonly string[];
  readonly priorEdgeRefs: readonly string[];
  readonly resultReportSchema: readonly string[];
  readonly packageDigest: string;
}

export interface SdlcWorkerWorkCategoryGovernanceSelection {
  readonly kind: "sdlc_work_category_governance_selection";
  readonly category: SdlcWorkCategoryGovernanceCategory;
  readonly configRef: string;
  readonly workerPath: string;
  readonly selectionSource: "graph_function_catalog";
  readonly edgeName: string;
  readonly targetAssetType: string;
}

export interface SdlcWorkerConstructionBriefPackageDisposition {
  readonly kind: "sdlc_worker_construction_brief_package_disposition";
  readonly packageName: string;
  readonly path: string;
  readonly digest: string;
  readonly disposition: "canonical" | "derive" | "forensic";
  readonly role: string;
}

export interface SdlcTenantToolEnvironmentProjection {
  readonly kind: "sdlc_tenant_tool_environment_projection";
  readonly sourceRefs: readonly string[];
  readonly disabledTools: readonly string[];
  readonly allowedTools: readonly string[];
  readonly workspaceLocalDirectories: readonly string[];
  readonly environmentVariableNames: readonly string[];
}

export interface SdlcWorkerConstructionBrief {
  readonly kind: "sdlc_worker_construction_brief";
  readonly briefVersion: "ts-worker-construction-brief-v1";
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly workCategoryGovernance: SdlcWorkerWorkCategoryGovernanceSelection;
  readonly targetCarrierProjection: SdlcWorkerTargetCarrierPromptProjection;
  readonly canonicalPromptCarrierPath: string;
  readonly promptSourcePolicyRef: string;
  readonly packageDispositions: readonly SdlcWorkerConstructionBriefPackageDisposition[];
  readonly currentState: {
    readonly workspaceRoot: string;
    readonly archiveRoot: string;
    readonly authorityRefs: readonly string[];
    readonly authorityIndex: readonly SdlcAuthorityIndexEntry[];
    readonly tenantStackAuthorityRefs: readonly string[];
    readonly tenantToolEnvironment: SdlcTenantToolEnvironmentProjection;
    readonly priorEdgeRefs: readonly string[];
    readonly omittedPriorEdgeRefCount: number;
    readonly runtimeContextRefs: readonly string[];
    readonly omittedRuntimeContextRefCount: number;
  };
  readonly stagePressure: {
    readonly producedStagedAuthorityRefs: readonly string[];
    readonly requiredStagedAuthorityRefs: readonly string[];
    readonly designDepthEvaluatorRegisterRefs: readonly string[];
    readonly expectedDesignDepthEvaluatorRegisterPath: string | null;
    readonly proportionalityProfile: SdlcComputeProportionalityProfile | null;
  };
  readonly computeSubworkstreamPolicy: SdlcComputeSubworkstreamPolicy;
  readonly targetState: {
    readonly outputFile: string;
    readonly reportFile: string;
    readonly subworkstreamManifestFile: string;
    readonly materializationRequired: boolean;
    readonly tenantRoot: string;
    readonly selectedOutputRoot: string;
    readonly declaredProductFileTargets: readonly string[];
    readonly requiredRoles: readonly SdlcMaterializedProductFileRole[];
    readonly buildExecutionContract: string;
    readonly testExecutionContract: string;
  };
  readonly authority: {
    readonly edgeAssuranceContractRef: string | null;
    readonly edgeAssuranceContractDigest: string | null;
    readonly targetCarrierContractRef: string | null;
    readonly targetCarrierContractDigest: string | null;
    readonly targetCarrierProjectionRef: string;
    readonly traversalStrategyDecisionRef: string;
    readonly featureScopeRef: string;
  };
  readonly obligations: {
    readonly inlineObligations: readonly SdlcWorkerInvocationObligation[];
    readonly inlineRequirementPressureRows: readonly SdlcWorkerInvocationObligation[];
    readonly inlineObligationIds: readonly string[];
    readonly requirementTraceObligationIds: readonly string[];
    readonly omittedObligationCount: number;
    readonly omittedRequirementTraceObligationCount: number;
    readonly obligationDeltaSummary: SdlcTraversalObligationDeltaSummary;
  };
  readonly retryAndRepair: {
    readonly retryAttemptRefs: readonly string[];
    readonly gapDossierRefs: readonly string[];
    readonly retryInstructionCount: number;
    readonly repairReentryPlanCount: number;
  };
  readonly packageDigest: string;
}

export interface SdlcWorkerBrief {
  readonly kind: "sdlc_worker_brief";
  readonly briefVersion: "ts-worker-brief-v1";
  readonly edgeAssuranceContractRef?: string;
  readonly edgeAssuranceContractDigest?: string;
  readonly targetCarrierContractRef?: string;
  readonly targetCarrierContractDigest?: string;
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly outputFile: string;
  readonly reportFile: string;
  readonly materializationRequired: boolean;
  readonly allowedWriteRoots: readonly string[];
  readonly requiredSchema: readonly string[];
  readonly refs: {
    readonly workerInvocationPackagePath: string;
    readonly traversalIntentPackagePath: string;
    readonly handoffManifestPath: string;
    readonly conformedProjectPath: string;
    readonly fpTransformRequestFile: string;
    readonly fpTransformResultFile: string;
    readonly fpEvaluateResultFile: string;
  };
  readonly digests: {
    readonly workerInvocationPackageDigest: string;
    readonly traversalIntentPackageDigest: string;
    readonly handoffManifestDigest: string;
  };
  readonly retryInstructionCount: number;
  readonly repairReentryPlanCount: number;
}

// Compact projection of the admitted SdlcTraversalHopSelection for the
// worker-facing brief (T-187 A-050). Not an authority carrier: it is a
// read-model budget derived from the already-admitted hop selection so the
// brief carries the proportionality/Min(F_P) fact instead of generic prose.
export interface SdlcComputeProportionalityProfile {
  readonly kind: "sdlc_compute_proportionality_profile";
  readonly hopClass: SdlcTraversalHopClass;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly pressureMechanism: SdlcMinFpPressurePreservationMechanism;
  readonly selectedGraphVariantRef: string;
  readonly inputObligationCount: number;
  readonly outputRowCount: number;
  readonly profileClass: "degenerate" | "compact" | "broad";
  readonly maxModules: number | null;
  readonly maxComponents: number;
}

export interface SdlcWorkerHandoffManifest {
  readonly kind: "sdlc_worker_handoff_manifest";
  readonly contractVersion: "ts-operator-v1";
  readonly ticketExecutionContract?: SdlcTicketExecutionContract | null;
  readonly overlayRef: string | null;
  readonly overlayBindingRef: string | null;
  readonly graphCatalogDigestRef: string | null;
  readonly edgeAssuranceContractRef?: string;
  readonly edgeAssuranceContractDigest?: string;
  readonly targetCarrierContractRef?: string;
  readonly targetCarrierContractDigest?: string;
  readonly targetCarrierProjection: SdlcWorkerTargetCarrierProjection;
  readonly proportionalityProfile?: SdlcComputeProportionalityProfile | null;
  readonly workspaceRoot: string;
  readonly archiveRoot: string;
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly inputAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly outputFile: string;
  readonly reportFile: string;
  readonly subworkstreamManifestFile: string;
  readonly fpTransformRequest: FpTransformRequest | null;
  readonly fpTransformRequestFile: string;
  readonly fpTransformResultFile: string;
  readonly fpEvaluateResultFile: string;
  readonly allowedWriteRoots: readonly string[];
  readonly conformedProject: SdlcConformProjectProfile;
  readonly productMaterialization: SdlcProductMaterializationContract;
  readonly traversalStrategyDecision: SdlcTraversalStrategyDecision;
  readonly featureScope: SdlcFeatureScope;
  readonly traversalObligationContext: SdlcTraversalObligationContext;
  readonly traversalIntentPackage: SdlcTraversalIntentPackage;
  readonly traversalAttemptEnvelope: TraversalAttemptEnvelope | null;
  readonly retryContext: SdlcWorkerRetryContext;
  readonly methodRefs: readonly string[];
  readonly resultReportSchema: readonly string[];
}

export interface SdlcWorkerResultReport {
  readonly kind: "odd_sdlc.worker_result_report";
  readonly projectionRole: "typed_fp_stage_projection";
  readonly authoritativeStageResultRef: string;
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly outputFile: string;
  readonly digest: string;
  readonly summary: string;
  readonly unresolvedReasons: readonly string[];
  readonly materializedFiles: readonly SdlcMaterializedProductFile[];
  readonly materializationDiagnostics: readonly SdlcWorkerResultMaterializationDiagnostic[];
  readonly executionEvidence: SdlcWorkerExecutionEvidence | null;
  readonly executionEvidenceErrors: readonly string[];
  readonly obligationAssessments: readonly SdlcWorkerObligationAssessment[];
  readonly subworkstreamManifest: SdlcComputeSubworkstreamManifest;
  readonly fpTransformRequestRef: string | null;
  readonly fpTransformResultRef: string | null;
  readonly fpTransformStatusSnapshot: FpTransformResult["status"] | null;
  readonly fpEvaluateResultRef: string | null;
}

export interface SdlcWorkerResultMaterializationDiagnostic {
  readonly kind: "sdlc_worker_result_materialization_diagnostic";
  readonly code: SdlcBlockingReasonCode;
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
}

export type SdlcPostflightResultStatus = "passed" | "blocked" | "diagnostic";

export type SdlcFpEvaluateResultStatus =
  | "passed"
  | "blocked"
  | "admitted_with_open_obligations";

export interface SdlcPostflightResult {
  readonly kind: "sdlc_operator_postflight_result";
  readonly status: SdlcPostflightResultStatus;
  readonly blockingReasons: readonly string[];
  readonly blockingReasonCarriers: readonly SdlcBlockingReason[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcFpEvaluateResult {
  readonly kind: "sdlc_fp_evaluate_result";
  readonly stage: "F_P.evaluate";
  readonly computeNotationStage: "evaluate.C";
  readonly stageAuthority: "typed_fp_stage_carriers";
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly workerReportProjectionRef: string;
  readonly transformResultRef: string | null;
  readonly postflightRef: string;
  readonly evaluationRef: string;
  readonly findings: readonly GtlEvaluationFindingRef[];
  readonly evaluation: GtlEvaluation;
  readonly status: SdlcFpEvaluateResultStatus;
  readonly postflightStatus: SdlcPostflightResult["status"];
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly subworkstreamManifestRef: string;
  readonly subworkstreamManifest: SdlcComputeSubworkstreamManifest;
  readonly subworkstreamCounts: {
    readonly total: number;
    readonly done: number;
    readonly blocked: number;
    readonly failed: number;
    readonly discarded: number;
  };
  readonly obligationAssessmentCounts: {
    readonly total: number;
    readonly fulfilled: number;
    readonly partial: number;
    readonly blocked: number;
    readonly unassessed: number;
  };
  readonly executionEvidenceStatusSnapshot: SdlcWorkerExecutionEvidence["status"] | null;
}

export interface SdlcInstalledOperatorStartOutcome {
  readonly kind: "sdlc_installed_operator_start_outcome";
  readonly status: SdlcInstalledOperatorStatus;
  readonly summary: SdlcOperatorSummary;
  readonly start: SdlcPublicStartOutcome;
  readonly transport: SdlcWorkerTransportContract | null;
  readonly manifest: SdlcWorkerHandoffManifest | null;
  readonly workerRun: SdlcWorkerRunResult | null;
  readonly workerReport: SdlcWorkerResultReport | null;
  readonly postflight: SdlcPostflightResult | null;
  readonly assuranceSatisfaction: SdlcTraversalRequirementSatisfaction | null;
  readonly gapDossier: SdlcPostflightGapDossier | null;
  readonly hookOutcome: SdlcHookTurnOutcome | null;
  readonly replayEventCountBefore: number;
  readonly replayEventCountAfter: number;
  readonly emittedRuntimeEventKinds: readonly RuntimeEvent["kind"][];
  readonly eventLogPath: string;
  readonly archiveRoot: string | null;
  readonly traversalConsequence: SdlcInstalledOperatorTraversalConsequence | null;
}
