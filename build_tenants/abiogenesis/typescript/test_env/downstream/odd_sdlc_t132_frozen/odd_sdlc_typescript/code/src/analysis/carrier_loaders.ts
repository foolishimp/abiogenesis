// Implements: T-161

import {
  existsSync,
  statSync
} from "node:fs";
import path from "node:path";

import {
  fileSizeOrZero,
  loadJsonFile,
  loadJsonlFile,
  type LoadedJson,
  type LoadedJsonl
} from "./archive_reader.js";
import {
  arrayOf,
  guardKind,
  guardKinds,
  isNonNegativeFiniteNumber,
  isRecord,
  isTrimmedNonEmptyString,
  nullable,
  oneOf,
  recordShape
} from "../admission/codecs.js";
import {
  SDLC_MIN_FP_PRESSURE_PRESERVATION_MECHANISMS,
  SDLC_DEPENDENCY_TRAVERSAL_METHODS,
  SDLC_TRAVERSAL_HOP_CLASSES,
  SDLC_TRAVERSAL_OUTCOME_CLASSES,
  SDLC_ZOOM_ADMISSION_DISPOSITIONS
} from "../contracts/carrier_domain_catalog.js";
import {
  SDLC_OPERATOR_RUN_ARTIFACT_CATALOG,
  requireOperatorRunArtifactRowForArtifactRef,
  type SdlcOperatorRunArtifactRow
} from "../contracts/operator_run_artifact_catalog.js";
import {
  isSdlcLiveFpParallelMaterializationFrontier,
  type SdlcLiveFpParallelMaterializationFrontier
} from "../operator/live_fp_parallel_materialization_frontier.js";
import { admitDesignDepthFpEvaluatorRegisterArtifact } from "../operator/plugins/evaluate/index.js";
import type {
  SdlcDecompositionAdmissionDecision,
  SdlcDecompositionDownstreamKind,
  SdlcDecompositionSummary,
  SdlcDecompositionSummaryRow,
  SdlcDecompositionUpstreamKind,
  SdlcDependencyMapNode,
  SdlcDependencyTraversalMethod,
  SdlcDependencyTraversalSelection,
  SdlcMinFpPressurePreservationDecision,
  SdlcMinFpPressurePreservationMechanism,
  SdlcModuleDependencyMap,
  SdlcPostflightGapDossier,
  SdlcReviewGradeEdgeFulfillmentAssessment,
  SdlcReviewGradeObligationFinding,
  SdlcTestDependencyMap,
  SdlcTraversalComplexityAssessment,
  SdlcTraversalHopClass,
  SdlcTraversalHopSelection,
  SdlcTraversalOutcomeClass,
  SdlcZoomAdmissionDisposition,
  SdlcZoomAdmissionDecision
} from "../operator/carriers.js";

export interface OperatorSummaryRecord {
  readonly kind: "sdlc_operator_summary";
  readonly graphFunctionName?: string;
  readonly currentEdge?: string;
  readonly status?: string;
  readonly blockingReason?: string | null;
  readonly nextLawfulAction?: string;
  readonly archiveRoot?: string;
}

export interface WorkerRunRecord {
  readonly kind: "sdlc_worker_run_result";
  readonly elapsedMs?: number;
  readonly stdoutByteCount?: number;
  readonly stderrByteCount?: number;
  readonly status?: number;
  readonly signal?: string | null;
  readonly timedOut?: boolean;
  readonly toolCallCount?: number;
}

export interface PostflightRecord {
  readonly kind: "sdlc_operator_postflight_result";
  readonly status?: string;
  readonly blockingReasons?: readonly unknown[];
  readonly blockingReasonCarriers?: readonly unknown[];
  readonly evidenceRefs?: readonly string[];
}

export interface EdgeClosureDecisionRecord {
  readonly kind: "sdlc_edge_closure_decision";
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly disposition?: string;
  readonly decisionRef?: string;
  readonly ledgerRef?: string;
  readonly basisRefs?: readonly string[];
}

export interface EdgeFulfillmentLedgerRecord {
  readonly kind: "sdlc_edge_fulfillment_ledger";
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly edgeRef?: string;
  readonly attemptRef?: string;
  readonly counts?: {
    readonly expected?: number;
    readonly fulfilled?: number;
    readonly partial?: number;
    readonly blocked?: number;
    readonly unfulfilled?: number;
    readonly missing?: number;
    readonly extra?: number;
  };
  readonly targetCarrierAdmissionStatus?: string;
  readonly targetCarrierAdmissionRef?: string | null;
  readonly edgeResidualPressureRefs?: readonly string[];
}

export interface EdgeGainRecord {
  readonly kind: "sdlc_edge_gain";
  readonly residualPressureRefs?: readonly string[];
  readonly evidenceRefs?: readonly string[];
}

export interface NextActionProjectionRecord {
  readonly kind: "sdlc_next_action_projection";
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly choosesNextTraversal?: boolean;
  readonly nextActionProjectionRef?: string;
  readonly selectedActionRef?: string;
  readonly nextGraphFunctionRef?: string;
  readonly nextGraphVectorRef?: string;
  readonly predecessorRefs?: readonly string[];
  readonly overlayRef?: string | null;
}

export interface ProductMaterializationFileRecord {
  readonly kind: "sdlc_materialized_product_file";
  readonly role?: string;
  readonly relativePath?: string;
  readonly absolutePath?: string;
  readonly digest?: string;
  readonly byteCount?: number;
  readonly materializationSource?: string;
  readonly requirementTraceObligationIds?: readonly string[];
}

export interface ProductMaterializationManifestRecord {
  readonly kind: "sdlc_product_materialization_manifest";
  readonly contract?: {
    readonly required?: boolean;
    readonly tenantRoot?: string;
    readonly requiredRoles?: readonly string[];
  };
  readonly files?: readonly ProductMaterializationFileRecord[];
}

export interface HandoffManifestRecord {
  readonly kind: "sdlc_worker_handoff_manifest";
  readonly graphFunctionName?: string;
  readonly edgeName?: string;
  readonly vectorIndex?: number;
  readonly targetAssetType?: string;
  readonly inputAssetTypes?: readonly string[];
}

export interface FpEvaluateResultRecord {
  readonly kind: "sdlc_fp_evaluate_result";
  readonly computeNotationStage: "evaluate.C";
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly evaluationRef?: string;
  readonly status?: string;
  readonly postflightStatus?: string;
  readonly blockingReasons?: readonly unknown[];
  readonly evidenceRefs?: readonly string[];
}

export interface DesignDepthFpEvaluatorRunRecord {
  readonly kind: "sdlc_design_depth_fp_evaluator_run";
  readonly lifecycleStatus?: "started" | "completed" | "interrupted";
  readonly status?: number | null;
  readonly signal?: string | null;
  readonly elapsedMs?: number;
  readonly timedOut?: boolean;
  readonly promptRef?: string;
  readonly contentRegisterRef?: string;
  readonly registerProjectionRef?: string;
  readonly registerRef?: string;
  readonly processEventsRef?: string;
}

export interface EvaluateContentRegisterRecord {
  readonly kind: "sdlc_evaluate_content_register";
  readonly registerVersion?: string;
  readonly stage?: string;
  readonly ruleRef?: string;
  readonly authorityFunction?: string;
}

export interface ReviewGradeEdgeFulfillmentRunRecord {
  readonly kind: "sdlc_review_grade_edge_fulfillment_run";
  readonly lifecycleStatus?: "started" | "completed" | "interrupted";
  readonly status?: number | null;
  readonly signal?: string | null;
  readonly elapsedMs?: number;
  readonly timedOut?: boolean;
  readonly promptRef?: string;
  readonly assessmentRef?: string;
  readonly processEventsRef?: string;
}

export interface GtlAdmittedStateRefRecord {
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly graphCallRef: string;
  readonly frameRef: string;
  readonly eventRefs: readonly string[];
  readonly ledgerRefs: readonly string[];
  readonly projectionRefs: readonly string[];
}

export interface GtlConsequenceProjectionRefRecord {
  readonly consequenceRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly assuranceDecisionRef: string;
  readonly traversalTransitionRef: string;
  readonly domainReadModelRefs: readonly string[];
}

export interface WorkerProcessStartedRecord {
  readonly kind: "actor_process_started";
  readonly pid?: number;
  readonly observedAtMs?: number | null;
}

export interface WorkerProcessEventRecord {
  readonly kind: string;
  readonly observedAtMs?: number | null;
  readonly elapsedMs?: number | null;
  readonly pid?: number | null;
  readonly heartbeatIndex?: number | null;
  readonly status?: number | null;
  readonly signal?: string | null;
}

export interface RuntimeEventsArchiveRecord {
  readonly kind: "sdlc_runtime_event_archive_projection";
  readonly archiveVersion?: string;
  readonly eventCount?: number;
  readonly eventKinds?: readonly string[];
  readonly events?: readonly unknown[];
}

export interface RunPerformanceSummaryRecord {
  readonly kind: "sdlc_run_performance_summary" | "sdlc_edge_performance_summary";
  readonly fields?: Readonly<Record<string, unknown>>;
}

export interface WorkerResultReportRecord {
  readonly kind: "odd_sdlc.worker_result_report";
  readonly outputFile?: string;
  readonly obligationAssessments?: readonly unknown[];
  readonly unresolvedReasons?: readonly unknown[];
  readonly executionEvidence?: {
    readonly lane?: string;
    readonly command?: string;
    readonly status?: string;
    readonly reportRefs?: readonly string[];
    readonly testsObserved?: number | null;
    readonly passedCount?: number | null;
    readonly failedCount?: number | null;
    readonly shardEvidence?: readonly {
      readonly shardId?: string;
      readonly moduleName?: string;
      readonly lane?: string;
      readonly command?: string;
      readonly status?: string;
      readonly reportRefs?: readonly string[];
      readonly testsObserved?: number | null;
      readonly passedCount?: number | null;
      readonly failedCount?: number | null;
    }[];
  } | null;
}

export interface WorkerConstructionBriefRecord {
  readonly kind: "sdlc_worker_construction_brief";
  readonly canonicalPromptCarrierPath?: string;
  readonly promptSourcePolicyRef?: string;
  readonly packageDigest?: string;
  readonly packageDispositions?: readonly {
    readonly packageName?: string;
    readonly path?: string;
    readonly digest?: string;
    readonly disposition?: string;
  }[];
}

export type LiveFpParallelMaterializationFrontierRecord =
  SdlcLiveFpParallelMaterializationFrontier;

export type LoadedOperatorRunArtifact =
  | LoadedJson<unknown>
  | LoadedJsonl<unknown>
  | { readonly status: "present"; readonly bytes: number; readonly path: string }
  | { readonly status: "missing" };

export interface OperatorRunCarriers {
  readonly operatorRunRoot: string;
  readonly operatorSummary: LoadedJson<OperatorSummaryRecord>;
  readonly workerRun: LoadedJson<WorkerRunRecord>;
  readonly postflight: LoadedJson<PostflightRecord>;
  readonly edgeClosure: LoadedJson<EdgeClosureDecisionRecord>;
  readonly edgeFulfillmentLedger: LoadedJson<EdgeFulfillmentLedgerRecord>;
  readonly edgeGain: LoadedJson<EdgeGainRecord>;
  readonly nextActionProjection: LoadedJson<NextActionProjectionRecord>;
  readonly gtlAdmittedStateRef: LoadedJson<GtlAdmittedStateRefRecord>;
  readonly gtlConsequenceProjectionRef: LoadedJson<GtlConsequenceProjectionRefRecord>;
  readonly productManifest: LoadedJson<ProductMaterializationManifestRecord>;
  readonly handoffManifest: LoadedJson<HandoffManifestRecord>;
  readonly fpEvaluateResult: LoadedJson<FpEvaluateResultRecord>;
  readonly workerProcessStarted: LoadedJson<WorkerProcessStartedRecord>;
  readonly workerProcessEvents: LoadedJsonl<WorkerProcessEventRecord>;
  readonly runtimeEvents: LoadedJson<RuntimeEventsArchiveRecord>;
  readonly workerResultReport: LoadedJson<WorkerResultReportRecord>;
  readonly workerConstructionBrief: LoadedJson<WorkerConstructionBriefRecord>;
  readonly decompositionSummary: LoadedJson<SdlcDecompositionSummary>;
  readonly implementationDecompositionSummary: LoadedJson<SdlcDecompositionSummary>;
  readonly testDecompositionSummary: LoadedJson<SdlcDecompositionSummary>;
  readonly traversalHopSelection: LoadedJson<SdlcTraversalHopSelection>;
  readonly moduleDependencyMap: LoadedJson<SdlcModuleDependencyMap>;
  readonly moduleDependencyTraversalSelection: LoadedJson<SdlcDependencyTraversalSelection>;
  readonly testDependencyMap: LoadedJson<SdlcTestDependencyMap>;
  readonly testDependencyTraversalSelection: LoadedJson<SdlcDependencyTraversalSelection>;
  readonly uatTestDependencyMap: LoadedJson<SdlcTestDependencyMap>;
  readonly uatTestDependencyTraversalSelection: LoadedJson<SdlcDependencyTraversalSelection>;
  readonly liveFpParallelMaterializationFrontier: LoadedJson<LiveFpParallelMaterializationFrontierRecord>;
  readonly runPerformanceSummary: LoadedJson<RunPerformanceSummaryRecord>;
  readonly edgePerformanceSummary: LoadedJson<RunPerformanceSummaryRecord>;
  readonly artifactStateByRef: Readonly<Record<string, LoadedOperatorRunArtifact>>;
  readonly fileSizeByArtifactRef: Readonly<Record<string, number>>;
  readonly fileSizes: OperatorRunFileSizes;
}

export interface OperatorRunFileSizes {
  readonly handoffManifest: number;
  readonly traversalIntentPackage: number;
  readonly workerInvocationPackage: number;
  readonly workerPrompt: number;
  readonly workerStdout: number;
  readonly workerStderr: number;
  readonly workerProcessEvents: number;
  readonly runtimeEvents: number;
  readonly workerResultReport: number;
  readonly workerConstructionBrief: number;
  readonly productMaterializationManifest: number;
  readonly fpTransformRequest: number;
  readonly fpTransformResult: number;
  readonly hookOutcome: number;
  readonly postTransformObservation: number;
  readonly sdlcWorksiteEvidence: number;
  readonly sdlcEdgeClosureDecision: number;
  readonly sdlcEdgeFulfillmentLedger: number;
  readonly sdlcEdgeGain: number;
  readonly sdlcEdgeResidualPressure: number;
  readonly sdlcNextActionProjection: number;
  readonly gtlAdmittedStateRef: number;
  readonly gtlConsequenceProjectionRef: number;
  readonly sdlcDecompositionSummary: number;
  readonly sdlcImplementationDecompositionSummary: number;
  readonly sdlcTestDecompositionSummary: number;
  readonly sdlcTraversalHopSelection: number;
  readonly sdlcModuleDependencyMap: number;
  readonly sdlcModuleDependencyTraversalSelection: number;
  readonly sdlcTestDependencyMap: number;
  readonly sdlcTestDependencyTraversalSelection: number;
  readonly sdlcUatTestDependencyMap: number;
  readonly sdlcUatTestDependencyTraversalSelection: number;
  readonly sdlcLiveFpParallelMaterializationFrontier: number;
}

function guardJsonlEvent(value: unknown): value is WorkerProcessEventRecord {
  return isRecord(value) && typeof value["kind"] === "string";
}

const PRODUCT_MANIFEST_GUARD: (value: unknown) => value is ProductMaterializationManifestRecord =
  guardKind<ProductMaterializationManifestRecord>("sdlc_product_materialization_manifest");

const HANDOFF_MANIFEST_GUARD: (value: unknown) => value is HandoffManifestRecord =
  guardKind<HandoffManifestRecord>("sdlc_worker_handoff_manifest");

const OPERATOR_SUMMARY_GUARD: (value: unknown) => value is OperatorSummaryRecord =
  guardKind<OperatorSummaryRecord>("sdlc_operator_summary");

const WORKER_RUN_GUARD: (value: unknown) => value is WorkerRunRecord =
  guardKind<WorkerRunRecord>("sdlc_worker_run_result");

const POSTFLIGHT_GUARD: (value: unknown) => value is PostflightRecord =
  guardKind<PostflightRecord>("sdlc_operator_postflight_result");

const POSTFLIGHT_GAP_DOSSIER_GUARD:
  (value: unknown) => value is SdlcPostflightGapDossier =
  guardKind<SdlcPostflightGapDossier>("sdlc_postflight_gap_dossier");

const EDGE_CLOSURE_GUARD: (value: unknown) => value is EdgeClosureDecisionRecord =
  recordShape<EdgeClosureDecisionRecord>({
    kind: "sdlc_edge_closure_decision",
    fields: {
      compositionRef: isTrimmedNonEmptyString,
      compositionDigest: isTrimmedNonEmptyString,
      compositionSelectionRef: isTrimmedNonEmptyString,
      selectedRegimeBindingRef: nullable(isTrimmedNonEmptyString)
    }
  });

const EDGE_FULFILLMENT_GUARD: (value: unknown) => value is EdgeFulfillmentLedgerRecord =
  recordShape<EdgeFulfillmentLedgerRecord>({
    kind: "sdlc_edge_fulfillment_ledger",
    fields: {
      compositionRef: isTrimmedNonEmptyString,
      compositionDigest: isTrimmedNonEmptyString,
      compositionSelectionRef: isTrimmedNonEmptyString,
      selectedRegimeBindingRef: nullable(isTrimmedNonEmptyString)
    }
  });

const EDGE_GAIN_GUARD: (value: unknown) => value is EdgeGainRecord =
  guardKind<EdgeGainRecord>("sdlc_edge_gain");

const NEXT_ACTION_GUARD: (value: unknown) => value is NextActionProjectionRecord =
  recordShape<NextActionProjectionRecord>({
    kind: "sdlc_next_action_projection",
    fields: {
      compositionRef: isTrimmedNonEmptyString,
      compositionDigest: isTrimmedNonEmptyString,
      compositionSelectionRef: isTrimmedNonEmptyString,
      selectedRegimeBindingRef: nullable(isTrimmedNonEmptyString)
    }
  });

const FP_EVALUATE_GUARD: (value: unknown) => value is FpEvaluateResultRecord =
  recordShape<FpEvaluateResultRecord>({
    kind: "sdlc_fp_evaluate_result",
    fields: {
      computeNotationStage: oneOf(["evaluate.C"]),
      compositionRef: isTrimmedNonEmptyString,
      compositionDigest: isTrimmedNonEmptyString,
      compositionSelectionRef: isTrimmedNonEmptyString,
      selectedRegimeBindingRef: nullable(isTrimmedNonEmptyString)
    }
  });

const DESIGN_DEPTH_FP_EVALUATOR_RUN_GUARD: (
  value: unknown
) => value is DesignDepthFpEvaluatorRunRecord =
  guardKind<DesignDepthFpEvaluatorRunRecord>("sdlc_design_depth_fp_evaluator_run");

const EVALUATE_CONTENT_REGISTER_GUARD: (
  value: unknown
) => value is EvaluateContentRegisterRecord =
  guardKind<EvaluateContentRegisterRecord>("sdlc_evaluate_content_register");

const REVIEW_GRADE_EDGE_FULFILLMENT_RUN_GUARD: (
  value: unknown
) => value is ReviewGradeEdgeFulfillmentRunRecord =
  guardKind<ReviewGradeEdgeFulfillmentRunRecord>("sdlc_review_grade_edge_fulfillment_run");

const REVIEW_GRADE_EDGE_FULFILLMENT_ASSESSMENT_GUARD: (
  value: unknown
) => value is SdlcReviewGradeEdgeFulfillmentAssessment =
  recordShape<SdlcReviewGradeEdgeFulfillmentAssessment>({
    kind: "sdlc_review_grade_edge_fulfillment_assessment",
    fields: {
      assessmentVersion: oneOf(["ts-review-grade-v1"]),
      graphFunctionName: isTrimmedNonEmptyString,
      edgeName: isTrimmedNonEmptyString,
      targetAssetType: isTrimmedNonEmptyString,
      status: oneOf(["passed", "blocked"]),
      reviewedObligationIds: arrayOf(isTrimmedNonEmptyString),
      findings: arrayOf(
        guardKind<SdlcReviewGradeObligationFinding>(
          "sdlc_review_grade_obligation_finding"
        )
      ),
      evidenceRefs: arrayOf(isTrimmedNonEmptyString),
      summary: isTrimmedNonEmptyString
    }
  });

const GTL_ADMITTED_STATE_REF_GUARD: (value: unknown) => value is GtlAdmittedStateRefRecord =
  recordShape<GtlAdmittedStateRefRecord>({
    fields: {
      compositionRef: isTrimmedNonEmptyString,
      compositionDigest: isTrimmedNonEmptyString,
      compositionSelectionRef: isTrimmedNonEmptyString,
      graphCallRef: isTrimmedNonEmptyString,
      frameRef: isTrimmedNonEmptyString,
      eventRefs: arrayOf(isTrimmedNonEmptyString),
      ledgerRefs: arrayOf(isTrimmedNonEmptyString),
      projectionRefs: arrayOf(isTrimmedNonEmptyString)
    }
  });

const GTL_CONSEQUENCE_PROJECTION_REF_GUARD: (
  value: unknown
) => value is GtlConsequenceProjectionRefRecord =
  recordShape<GtlConsequenceProjectionRefRecord>({
    fields: {
      consequenceRef: isTrimmedNonEmptyString,
      compositionRef: isTrimmedNonEmptyString,
      compositionDigest: isTrimmedNonEmptyString,
      compositionSelectionRef: isTrimmedNonEmptyString,
      assuranceDecisionRef: isTrimmedNonEmptyString,
      traversalTransitionRef: isTrimmedNonEmptyString,
      domainReadModelRefs: arrayOf(isTrimmedNonEmptyString)
    }
  });

const WORKER_PROCESS_STARTED_GUARD: (value: unknown) => value is WorkerProcessStartedRecord =
  guardKind<WorkerProcessStartedRecord>("actor_process_started");

const RUNTIME_EVENTS_GUARD: (value: unknown) => value is RuntimeEventsArchiveRecord =
  guardKind<RuntimeEventsArchiveRecord>("sdlc_runtime_event_archive_projection");

const WORKER_RESULT_REPORT_GUARD: (value: unknown) => value is WorkerResultReportRecord =
  guardKind<WorkerResultReportRecord>("odd_sdlc.worker_result_report");

const WORKER_CONSTRUCTION_BRIEF_GUARD: (value: unknown) => value is WorkerConstructionBriefRecord =
  guardKind<WorkerConstructionBriefRecord>("sdlc_worker_construction_brief");

const STRING_LIST_GUARD = arrayOf(isTrimmedNonEmptyString);

const DECOMPOSITION_UPSTREAM_KIND_GUARD =
  oneOf<SdlcDecompositionUpstreamKind>([
    "requirement",
    "design",
    "module",
    "component",
    "testcase"
  ]);

const DECOMPOSITION_DOWNSTREAM_KIND_GUARD =
  oneOf<SdlcDecompositionDownstreamKind>([
    "design",
    "module",
    "component",
    "function",
    "test_module",
    "test_class"
  ]);

const DECOMPOSITION_ADMISSION_DECISION_GUARD =
  oneOf<SdlcDecompositionAdmissionDecision>(["admit", "reject"]);

const TRAVERSAL_OUTCOME_CLASS_GUARD =
  oneOf<SdlcTraversalOutcomeClass>(SDLC_TRAVERSAL_OUTCOME_CLASSES);

const TRAVERSAL_HOP_CLASS_GUARD =
  oneOf<SdlcTraversalHopClass>(SDLC_TRAVERSAL_HOP_CLASSES);

const ZOOM_ADMISSION_DISPOSITION_GUARD =
  oneOf<SdlcZoomAdmissionDisposition>(SDLC_ZOOM_ADMISSION_DISPOSITIONS);

const MIN_FP_MECHANISM_GUARD =
  oneOf<SdlcMinFpPressurePreservationMechanism>(
    SDLC_MIN_FP_PRESSURE_PRESERVATION_MECHANISMS
  );

const DEPENDENCY_TRAVERSAL_METHOD_GUARD =
  oneOf<SdlcDependencyTraversalMethod>(SDLC_DEPENDENCY_TRAVERSAL_METHODS);

const DECOMPOSITION_SUMMARY_ROW_GUARD =
  recordShape<SdlcDecompositionSummaryRow>({
    fields: Object.freeze({
      downstreamId: isTrimmedNonEmptyString,
      parentId: nullable(isTrimmedNonEmptyString),
      ownedUpstreamRefs: STRING_LIST_GUARD,
      ownedUpstreamCount: isNonNegativeFiniteNumber,
      publicBoundaryRefs: STRING_LIST_GUARD,
      publicBoundaryCount: isNonNegativeFiniteNumber,
      substantiveResponsibilityRefs: STRING_LIST_GUARD,
      substantiveResponsibilityCount: isNonNegativeFiniteNumber,
      materializationTargetRefs: STRING_LIST_GUARD,
      residualRefs: STRING_LIST_GUARD
    })
  });

const DECOMPOSITION_SUMMARY_GUARD: (value: unknown) => value is SdlcDecompositionSummary =
  recordShape<SdlcDecompositionSummary>({
    kind: "sdlc_decomposition_summary",
    fields: Object.freeze({
      stageId: isTrimmedNonEmptyString,
      upstreamKind: DECOMPOSITION_UPSTREAM_KIND_GUARD,
      downstreamKind: DECOMPOSITION_DOWNSTREAM_KIND_GUARD,
      thresholdProfileRef: isTrimmedNonEmptyString,
      stageUpstreamUniverseRefs: STRING_LIST_GUARD,
      upstreamCount: isNonNegativeFiniteNumber,
      downstreamCount: isNonNegativeFiniteNumber,
      upstreamPerDownstreamRatio: isNonNegativeFiniteNumber,
      downstreamPerUpstreamRatio: isNonNegativeFiniteNumber,
      maxUpstreamPerDownstreamRatio: isNonNegativeFiniteNumber,
      maxDownstreamPerUpstream: isNonNegativeFiniteNumber,
      maxOwnedUpstreamPerDownstream: isNonNegativeFiniteNumber,
      maxOwnedUpstreamWithoutBoundary: isNonNegativeFiniteNumber,
      rows: arrayOf(DECOMPOSITION_SUMMARY_ROW_GUARD),
      overloadedDownstreamIds: STRING_LIST_GUARD,
      explosionUpstreamRefs: STRING_LIST_GUARD,
      unownedDownstreamIds: STRING_LIST_GUARD,
      facadeDownstreamIds: STRING_LIST_GUARD,
      underDecomposedParentIds: STRING_LIST_GUARD,
      residualRefs: STRING_LIST_GUARD,
      residualOutsideSubsurfaceRefs: STRING_LIST_GUARD,
      invalidReferenceFields: STRING_LIST_GUARD,
      blockingReasons: STRING_LIST_GUARD,
      admissionDecision: DECOMPOSITION_ADMISSION_DECISION_GUARD
    })
  });

const TRAVERSAL_COMPLEXITY_ASSESSMENT_GUARD =
  recordShape<SdlcTraversalComplexityAssessment>({
    kind: "sdlc_traversal_complexity_assessment",
    fields: Object.freeze({
      assessmentRef: isTrimmedNonEmptyString,
      outcomeClass: TRAVERSAL_OUTCOME_CLASS_GUARD,
      thresholdProfileRef: isTrimmedNonEmptyString,
      decompositionSummaryRef: nullable(isTrimmedNonEmptyString),
      inputObligationCount: isNonNegativeFiniteNumber,
      outputRowCount: isNonNegativeFiniteNumber,
      upstreamPerDownstreamRatio: isNonNegativeFiniteNumber,
      downstreamPerUpstreamRatio: isNonNegativeFiniteNumber,
      maxOwnedInputsPerOutput: isNonNegativeFiniteNumber,
      residualRefCount: isNonNegativeFiniteNumber,
      residualOutsideSubsurfaceRefCount: isNonNegativeFiniteNumber,
      publicBoundaryCount: isNonNegativeFiniteNumber,
      substantiveDownstreamResponsibilityCount: isNonNegativeFiniteNumber,
      blockingReasons: STRING_LIST_GUARD,
      evidenceRefs: STRING_LIST_GUARD
    })
  });

const ZOOM_ADMISSION_GUARD =
  recordShape<SdlcZoomAdmissionDecision>({
    kind: "sdlc_zoom_admission_decision",
    fields: Object.freeze({
      disposition: ZOOM_ADMISSION_DISPOSITION_GUARD,
      reasonRefs: STRING_LIST_GUARD,
      selectedZoomStageRef: nullable(isTrimmedNonEmptyString)
    })
  });

const MIN_FP_PRESSURE_PRESERVATION_GUARD =
  recordShape<SdlcMinFpPressurePreservationDecision>({
    kind: "sdlc_min_fp_pressure_preservation_decision",
    fields: Object.freeze({
      mechanism: MIN_FP_MECHANISM_GUARD,
      preservedPressureRefs: STRING_LIST_GUARD,
      skippedEdgeRefs: STRING_LIST_GUARD,
      evidenceRefs: STRING_LIST_GUARD,
      admissionDecision: DECOMPOSITION_ADMISSION_DECISION_GUARD,
      blockingReasons: STRING_LIST_GUARD
    })
  });

const TRAVERSAL_HOP_SELECTION_GUARD: (value: unknown) => value is SdlcTraversalHopSelection =
  recordShape<SdlcTraversalHopSelection>({
    kind: "sdlc_traversal_hop_selection",
    fields: Object.freeze({
      selectionRef: isTrimmedNonEmptyString,
      outcomeClass: TRAVERSAL_OUTCOME_CLASS_GUARD,
      hopClass: TRAVERSAL_HOP_CLASS_GUARD,
      selectedGraphVariantRef: isTrimmedNonEmptyString,
      complexityAssessment: TRAVERSAL_COMPLEXITY_ASSESSMENT_GUARD,
      zoomAdmission: ZOOM_ADMISSION_GUARD,
      pressurePreservation: MIN_FP_PRESSURE_PRESERVATION_GUARD,
      rejectedAlternativeRefs: STRING_LIST_GUARD,
      blockingReasons: STRING_LIST_GUARD,
      evidenceRefs: STRING_LIST_GUARD
    })
  });

const DEPENDENCY_MAP_NODE_GUARD =
  recordShape<SdlcDependencyMapNode>({
    fields: Object.freeze({
      nodeId: isTrimmedNonEmptyString,
      predecessorNodeIds: STRING_LIST_GUARD,
      successorNodeIds: STRING_LIST_GUARD,
      ownedRequirementRefs: STRING_LIST_GUARD,
      materializationTargetRefs: STRING_LIST_GUARD
    })
  });

const MODULE_DEPENDENCY_MAP_GUARD: (value: unknown) => value is SdlcModuleDependencyMap =
  recordShape<SdlcModuleDependencyMap>({
    kind: "sdlc_module_dependency_map",
    fields: Object.freeze({
      mapRef: isTrimmedNonEmptyString,
      summaryRef: isTrimmedNonEmptyString,
      nodes: arrayOf(DEPENDENCY_MAP_NODE_GUARD),
      steelThreadCandidateNodeIds: STRING_LIST_GUARD,
      parallelPartitionRefs: STRING_LIST_GUARD,
      cycleRefs: STRING_LIST_GUARD
    })
  });

const TEST_DEPENDENCY_MAP_GUARD: (value: unknown) => value is SdlcTestDependencyMap =
  recordShape<SdlcTestDependencyMap>({
    kind: "sdlc_test_dependency_map",
    fields: Object.freeze({
      mapRef: isTrimmedNonEmptyString,
      summaryRef: isTrimmedNonEmptyString,
      nodes: arrayOf(DEPENDENCY_MAP_NODE_GUARD),
      steelThreadCandidateNodeIds: STRING_LIST_GUARD,
      parallelShardRefs: STRING_LIST_GUARD,
      cycleRefs: STRING_LIST_GUARD
    })
  });

const DEPENDENCY_TRAVERSAL_SELECTION_GUARD:
  (value: unknown) => value is SdlcDependencyTraversalSelection =
  recordShape<SdlcDependencyTraversalSelection>({
    kind: "sdlc_dependency_traversal_selection",
    fields: Object.freeze({
      selectionRef: isTrimmedNonEmptyString,
      dependencyMapRef: isTrimmedNonEmptyString,
      dependencyMapKind: oneOf([
        "sdlc_module_dependency_map",
        "sdlc_test_dependency_map"
      ] as const),
      selectedMethod: DEPENDENCY_TRAVERSAL_METHOD_GUARD,
      selectedNodeIds: STRING_LIST_GUARD,
      parallelGroupRefs: STRING_LIST_GUARD,
      blockingReasons: STRING_LIST_GUARD,
      basisRefs: STRING_LIST_GUARD
    })
  });

const PERF_SUMMARY_GUARD: (value: unknown) => value is RunPerformanceSummaryRecord =
  guardKinds<RunPerformanceSummaryRecord>([
    "sdlc_run_performance_summary",
    "sdlc_edge_performance_summary"
  ]);

type JsonGuard<T> = (value: unknown) => value is T;

const OPERATOR_RUN_JSON_GUARDS: Readonly<Record<string, JsonGuard<unknown>>> =
  Object.freeze({
    "operator-run-artifact://operator-summary": OPERATOR_SUMMARY_GUARD,
    "operator-run-artifact://worker-run": WORKER_RUN_GUARD,
    "operator-run-artifact://postflight": POSTFLIGHT_GUARD,
    "operator-run-artifact://postflight-gap-dossier": POSTFLIGHT_GAP_DOSSIER_GUARD,
    "operator-run-artifact://edge-closure": EDGE_CLOSURE_GUARD,
    "operator-run-artifact://edge-fulfillment-ledger": EDGE_FULFILLMENT_GUARD,
    "operator-run-artifact://edge-gain": EDGE_GAIN_GUARD,
    "operator-run-artifact://next-action-projection": NEXT_ACTION_GUARD,
    "operator-run-artifact://gtl-admitted-state-ref": GTL_ADMITTED_STATE_REF_GUARD,
    "operator-run-artifact://gtl-consequence-projection-ref":
      GTL_CONSEQUENCE_PROJECTION_REF_GUARD,
    "operator-run-artifact://product-materialization-manifest": PRODUCT_MANIFEST_GUARD,
    "operator-run-artifact://handoff-manifest": HANDOFF_MANIFEST_GUARD,
    "operator-run-artifact://fp-evaluate-result": FP_EVALUATE_GUARD,
    "operator-run-artifact://review-grade-edge-fulfillment-assessment":
      REVIEW_GRADE_EDGE_FULFILLMENT_ASSESSMENT_GUARD,
    "operator-run-artifact://review-grade-edge-fulfillment-run":
      REVIEW_GRADE_EDGE_FULFILLMENT_RUN_GUARD,
    "operator-run-artifact://review-grade-edge-fulfillment-postflight":
      POSTFLIGHT_GUARD,
    "operator-run-artifact://design-depth-fp-evaluator-run":
      DESIGN_DEPTH_FP_EVALUATOR_RUN_GUARD,
    "operator-run-artifact://design-depth-fp-evaluator-content-register":
      EVALUATE_CONTENT_REGISTER_GUARD,
    "operator-run-artifact://design-depth-fp-evaluator-process-started":
      WORKER_PROCESS_STARTED_GUARD,
    "operator-run-artifact://fp-evaluator-postflight": POSTFLIGHT_GUARD,
    "operator-run-artifact://worker-process-started": WORKER_PROCESS_STARTED_GUARD,
    "operator-run-artifact://runtime-events": RUNTIME_EVENTS_GUARD,
    "operator-run-artifact://worker-result-report": WORKER_RESULT_REPORT_GUARD,
    "operator-run-artifact://worker-construction-brief": WORKER_CONSTRUCTION_BRIEF_GUARD,
    "operator-run-artifact://decomposition-summary": DECOMPOSITION_SUMMARY_GUARD,
    "operator-run-artifact://implementation-decomposition-summary": DECOMPOSITION_SUMMARY_GUARD,
    "operator-run-artifact://test-decomposition-summary": DECOMPOSITION_SUMMARY_GUARD,
    "operator-run-artifact://traversal-hop-selection": TRAVERSAL_HOP_SELECTION_GUARD,
    "operator-run-artifact://module-dependency-map": MODULE_DEPENDENCY_MAP_GUARD,
    "operator-run-artifact://module-dependency-traversal-selection": DEPENDENCY_TRAVERSAL_SELECTION_GUARD,
    "operator-run-artifact://test-dependency-map": TEST_DEPENDENCY_MAP_GUARD,
    "operator-run-artifact://test-dependency-traversal-selection": DEPENDENCY_TRAVERSAL_SELECTION_GUARD,
    "operator-run-artifact://uat-test-dependency-map": TEST_DEPENDENCY_MAP_GUARD,
    "operator-run-artifact://uat-test-dependency-traversal-selection":
      DEPENDENCY_TRAVERSAL_SELECTION_GUARD,
    "operator-run-artifact://live-fp-parallel-materialization-frontier":
      isSdlcLiveFpParallelMaterializationFrontier,
    "operator-run-artifact://run-performance-summary": PERF_SUMMARY_GUARD,
    "operator-run-artifact://edge-performance-summary": PERF_SUMMARY_GUARD
  });

const OPERATOR_RUN_JSONL_GUARDS: Readonly<Record<string, JsonGuard<unknown>>> =
  Object.freeze({
    "operator-run-artifact://worker-process-events": guardJsonlEvent,
    "operator-run-artifact://design-depth-fp-evaluator-process-events":
      guardJsonlEvent
  });

function operatorRunArtifactPath(input: {
  readonly operatorRunRoot: string;
  readonly artifact: SdlcOperatorRunArtifactRow;
}): string {
  return path.join(input.operatorRunRoot, input.artifact.relativePath);
}

function loadDesignDepthFpEvaluatorRegisterArtifact(
  filePath: string
): LoadedJson<unknown> {
  if (!existsSync(filePath)) {
    return Object.freeze({ status: "missing" as const });
  }
  const stats = statSync(filePath);
  if (!stats.isFile()) {
    return Object.freeze({
      status: "malformed" as const,
      bytes: 0,
      path: filePath,
      detail: "design_depth_fp_evaluator_register_not_file"
    });
  }
  const bytes = stats.size;
  const admission = admitDesignDepthFpEvaluatorRegisterArtifact({
    registerPath: filePath,
    archiveRoot: null
  });
  if (admission.status !== "admitted") {
    return Object.freeze({
      status: "malformed" as const,
      bytes,
      path: filePath,
      detail:
        admission.blockingReasons.length === 0
          ? "design_depth_fp_evaluator_register_rejected"
          : admission.blockingReasons.join("; ")
    });
  }
  return Object.freeze({
    status: "present" as const,
    data: admission.register,
    bytes,
    path: filePath
  });
}

function loadCatalogedOperatorRunArtifact(input: {
  readonly operatorRunRoot: string;
  readonly artifact: SdlcOperatorRunArtifactRow;
}): LoadedOperatorRunArtifact {
  const filePath = operatorRunArtifactPath(input);
  if (
    input.artifact.artifactRef ===
    "operator-run-artifact://design-depth-fp-evaluator-register"
  ) {
    return loadDesignDepthFpEvaluatorRegisterArtifact(filePath);
  }
  const jsonlGuard = OPERATOR_RUN_JSONL_GUARDS[input.artifact.artifactRef];
  if (jsonlGuard !== undefined) {
    return loadJsonlFile(filePath, jsonlGuard);
  }
  const jsonGuard = OPERATOR_RUN_JSON_GUARDS[input.artifact.artifactRef];
  if (jsonGuard !== undefined) {
    return loadJsonFile(filePath, jsonGuard);
  }
  const bytes = fileSizeOrZero(filePath);
  return bytes > 0
    ? Object.freeze({ status: "present" as const, bytes, path: filePath })
    : Object.freeze({ status: "missing" as const });
}

function catalogedArtifactStateByRef(
  operatorRunRoot: string
): Readonly<Record<string, LoadedOperatorRunArtifact>> {
  return Object.freeze(
    Object.fromEntries(
      SDLC_OPERATOR_RUN_ARTIFACT_CATALOG.map((artifact) => [
        artifact.artifactRef,
        loadCatalogedOperatorRunArtifact({ operatorRunRoot, artifact })
      ])
    )
  );
}

function catalogedFileSizeByArtifactRef(
  operatorRunRoot: string
): Readonly<Record<string, number>> {
  return Object.freeze(
    Object.fromEntries(
      SDLC_OPERATOR_RUN_ARTIFACT_CATALOG.map((artifact) => [
        artifact.artifactRef,
        fileSizeOrZero(operatorRunArtifactPath({ operatorRunRoot, artifact }))
      ])
    )
  );
}

function loadCatalogedJsonArtifact<T>(input: {
  readonly operatorRunRoot: string;
  readonly artifactRef: string;
  readonly guard: JsonGuard<T>;
}): LoadedJson<T> {
  const artifact = requireOperatorRunArtifactRowForArtifactRef(input.artifactRef);
  return loadJsonFile(
    operatorRunArtifactPath({ operatorRunRoot: input.operatorRunRoot, artifact }),
    input.guard
  );
}

function loadCatalogedJsonlArtifact<T>(input: {
  readonly operatorRunRoot: string;
  readonly artifactRef: string;
  readonly guard: JsonGuard<T>;
}): LoadedJsonl<T> {
  const artifact = requireOperatorRunArtifactRowForArtifactRef(input.artifactRef);
  return loadJsonlFile(
    operatorRunArtifactPath({ operatorRunRoot: input.operatorRunRoot, artifact }),
    input.guard
  );
}

export function readOperatorRunCarriers(operatorRunRoot: string): OperatorRunCarriers {
  const artifactStateByRef = catalogedArtifactStateByRef(operatorRunRoot);
  const fileSizeByArtifactRef = catalogedFileSizeByArtifactRef(operatorRunRoot);
  const sizeOfArtifact = (artifactRef: string): number =>
    fileSizeByArtifactRef[artifactRef] ?? 0;
  const fileSizes: OperatorRunFileSizes = Object.freeze({
    handoffManifest: sizeOfArtifact("operator-run-artifact://handoff-manifest"),
    traversalIntentPackage: sizeOfArtifact("operator-run-artifact://traversal-intent-package"),
    workerInvocationPackage: sizeOfArtifact("operator-run-artifact://worker-invocation-package"),
    workerPrompt: sizeOfArtifact("operator-run-artifact://worker-prompt"),
    workerStdout: sizeOfArtifact("operator-run-artifact://worker-stdout"),
    workerStderr: sizeOfArtifact("operator-run-artifact://worker-stderr"),
    workerProcessEvents: sizeOfArtifact("operator-run-artifact://worker-process-events"),
    runtimeEvents: sizeOfArtifact("operator-run-artifact://runtime-events"),
    workerResultReport: sizeOfArtifact("operator-run-artifact://worker-result-report"),
    workerConstructionBrief: sizeOfArtifact("operator-run-artifact://worker-construction-brief"),
    productMaterializationManifest: sizeOfArtifact("operator-run-artifact://product-materialization-manifest"),
    fpTransformRequest: sizeOfArtifact("operator-run-artifact://fp-transform-request"),
    fpTransformResult: sizeOfArtifact("operator-run-artifact://fp-transform-result"),
    hookOutcome: sizeOfArtifact("operator-run-artifact://hook-outcome"),
    postTransformObservation: sizeOfArtifact("operator-run-artifact://post-transform-observation"),
    sdlcWorksiteEvidence: sizeOfArtifact("operator-run-artifact://worksite-evidence"),
    sdlcEdgeClosureDecision: sizeOfArtifact("operator-run-artifact://edge-closure"),
    sdlcEdgeFulfillmentLedger: sizeOfArtifact("operator-run-artifact://edge-fulfillment-ledger"),
    sdlcEdgeGain: sizeOfArtifact("operator-run-artifact://edge-gain"),
    sdlcEdgeResidualPressure: sizeOfArtifact("operator-run-artifact://edge-residual-pressure"),
    sdlcNextActionProjection: sizeOfArtifact("operator-run-artifact://next-action-projection"),
    gtlAdmittedStateRef: sizeOfArtifact("operator-run-artifact://gtl-admitted-state-ref"),
    gtlConsequenceProjectionRef: sizeOfArtifact("operator-run-artifact://gtl-consequence-projection-ref"),
    sdlcDecompositionSummary: sizeOfArtifact("operator-run-artifact://decomposition-summary"),
    sdlcImplementationDecompositionSummary: sizeOfArtifact("operator-run-artifact://implementation-decomposition-summary"),
    sdlcTestDecompositionSummary: sizeOfArtifact("operator-run-artifact://test-decomposition-summary"),
    sdlcTraversalHopSelection: sizeOfArtifact("operator-run-artifact://traversal-hop-selection"),
    sdlcModuleDependencyMap: sizeOfArtifact("operator-run-artifact://module-dependency-map"),
    sdlcModuleDependencyTraversalSelection: sizeOfArtifact("operator-run-artifact://module-dependency-traversal-selection"),
    sdlcTestDependencyMap: sizeOfArtifact("operator-run-artifact://test-dependency-map"),
    sdlcTestDependencyTraversalSelection: sizeOfArtifact("operator-run-artifact://test-dependency-traversal-selection"),
    sdlcUatTestDependencyMap: sizeOfArtifact("operator-run-artifact://uat-test-dependency-map"),
    sdlcUatTestDependencyTraversalSelection: sizeOfArtifact("operator-run-artifact://uat-test-dependency-traversal-selection"),
    sdlcLiveFpParallelMaterializationFrontier: sizeOfArtifact("operator-run-artifact://live-fp-parallel-materialization-frontier")
  });
  return Object.freeze({
    operatorRunRoot,
    operatorSummary: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://operator-summary",
      guard: OPERATOR_SUMMARY_GUARD
    }),
    workerRun: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://worker-run",
      guard: WORKER_RUN_GUARD
    }),
    postflight: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://postflight",
      guard: POSTFLIGHT_GUARD
    }),
    edgeClosure: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://edge-closure",
      guard: EDGE_CLOSURE_GUARD
    }),
    edgeFulfillmentLedger: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://edge-fulfillment-ledger",
      guard: EDGE_FULFILLMENT_GUARD
    }),
    edgeGain: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://edge-gain",
      guard: EDGE_GAIN_GUARD
    }),
    nextActionProjection: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://next-action-projection",
      guard: NEXT_ACTION_GUARD
    }),
    gtlAdmittedStateRef: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://gtl-admitted-state-ref",
      guard: GTL_ADMITTED_STATE_REF_GUARD
    }),
    gtlConsequenceProjectionRef: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://gtl-consequence-projection-ref",
      guard: GTL_CONSEQUENCE_PROJECTION_REF_GUARD
    }),
    productManifest: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://product-materialization-manifest",
      guard: PRODUCT_MANIFEST_GUARD
    }),
    handoffManifest: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://handoff-manifest",
      guard: HANDOFF_MANIFEST_GUARD
    }),
    fpEvaluateResult: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://fp-evaluate-result",
      guard: FP_EVALUATE_GUARD
    }),
    workerProcessStarted: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://worker-process-started",
      guard: WORKER_PROCESS_STARTED_GUARD
    }),
    workerProcessEvents: loadCatalogedJsonlArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://worker-process-events",
      guard: guardJsonlEvent
    }),
    runtimeEvents: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://runtime-events",
      guard: RUNTIME_EVENTS_GUARD
    }),
    workerResultReport: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://worker-result-report",
      guard: WORKER_RESULT_REPORT_GUARD
    }),
    workerConstructionBrief: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://worker-construction-brief",
      guard: WORKER_CONSTRUCTION_BRIEF_GUARD
    }),
    decompositionSummary: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://decomposition-summary",
      guard: DECOMPOSITION_SUMMARY_GUARD
    }),
    implementationDecompositionSummary: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://implementation-decomposition-summary",
      guard: DECOMPOSITION_SUMMARY_GUARD
    }),
    testDecompositionSummary: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://test-decomposition-summary",
      guard: DECOMPOSITION_SUMMARY_GUARD
    }),
    traversalHopSelection: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://traversal-hop-selection",
      guard: TRAVERSAL_HOP_SELECTION_GUARD
    }),
    moduleDependencyMap: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://module-dependency-map",
      guard: MODULE_DEPENDENCY_MAP_GUARD
    }),
    moduleDependencyTraversalSelection: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://module-dependency-traversal-selection",
      guard: DEPENDENCY_TRAVERSAL_SELECTION_GUARD
    }),
    testDependencyMap: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://test-dependency-map",
      guard: TEST_DEPENDENCY_MAP_GUARD
    }),
    testDependencyTraversalSelection: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://test-dependency-traversal-selection",
      guard: DEPENDENCY_TRAVERSAL_SELECTION_GUARD
    }),
    uatTestDependencyMap: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://uat-test-dependency-map",
      guard: TEST_DEPENDENCY_MAP_GUARD
    }),
    uatTestDependencyTraversalSelection: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://uat-test-dependency-traversal-selection",
      guard: DEPENDENCY_TRAVERSAL_SELECTION_GUARD
    }),
    liveFpParallelMaterializationFrontier: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://live-fp-parallel-materialization-frontier",
      guard: isSdlcLiveFpParallelMaterializationFrontier
    }),
    runPerformanceSummary: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://run-performance-summary",
      guard: PERF_SUMMARY_GUARD
    }),
    edgePerformanceSummary: loadCatalogedJsonArtifact({
      operatorRunRoot,
      artifactRef: "operator-run-artifact://edge-performance-summary",
      guard: PERF_SUMMARY_GUARD
    }),
    artifactStateByRef,
    fileSizeByArtifactRef,
    fileSizes
  });
}
