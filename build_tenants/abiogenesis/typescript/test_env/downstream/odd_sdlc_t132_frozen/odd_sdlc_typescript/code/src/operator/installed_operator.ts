// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-052
// Implements: REQ-F-ODDSDLC-053
// Implements: REQ-F-ODDSDLC-054
// Implements: REQ-F-ODDSDLC-055
// Implements: REQ-F-ODDSDLC-056
// Implements: REQ-F-ODDSDLC-063
// Implements: REQ-F-ODDSDLC-064
// Implements: REQ-F-ODDSDLC-065
// Implements: REQ-F-ODDSDLC-066

import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import { writeUtf8FileAtomically } from "../effects/archive_store.js";
import { uniqueSorted } from "../shared/collections.js";
import { sdlcWorkerTargetUsesShellToolProfile } from "./worker_tool_profile.js";
import {
  admitGraphSpanAssessment,
  constructAllowedConsequenceTraversalCatalog,
  constructConsequenceProjectionOutcome,
  constructFdEvaluationOutcome,
  constructFpDispatchOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome,
  constructEvaluationRuleOutcome,
  constructRuntimeWatchdogPolicy,
  defaultFdEvaluatorPlugin,
  deriveAdvancementTransition,
  deriveIterationAdvanceDecision,
  deriveRuntimeAggregateProjection,
  deriveRuntimeContinuationTransitionProjectionFromDisposition,
  deriveRuntimeLivenessObserverProjection,
  invokeSupervisedProcessActor,
  materializeGraphFunction,
  runEngineIterateAsync,
  runtimeEventsForBasis,
  type ActorInvocation,
  type CanonicalRuntimeEvent,
  type EnginePluginInput,
  type EngineRunnerPluginSet,
  type EvaluationRuleOutcome,
  type ExecutionBasis,
  type ConsequenceProjectionOutcome,
  type FpDispatchOutcome,
  type FpEvaluationCloseDisposition,
  type FpEvaluationOutcome,
  type GtlAdmittedStateRef,
  type GtlConsequenceProjectionRef,
  type Module,
  type RuntimeEvent,
  type RuntimeFailureClass,
  type RuntimeAggregateProjection,
  type RuntimeLivenessObserverProjection,
  type SupervisedProcessActorResult,
  type TerminalKind,
  type TracedProcessExecutorProfile,
  type TracedProcessOutcome,
  type TracedProcessStreamModel
} from "@abiogenesis/typescript-tenant";
import {
  applyExplicitGraphVectorResumeCursor,
  applyGraphSpanReentryRoute,
  constructBranchExecutionPolicy,
  runEventedNativeSagaFrontier,
  type FreshRetryContextProjection,
  type NativeBranchTask
} from "@abiogenesis/typescript-tenant/abg/m03";
import {
  CONFORM_PROJECT_OUTPUTS,
  FG_CONFORM_PROJECT,
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  admitSdlcTargetCarrierCandidate,
  constructSdlcGtlModule,
  constructSdlcTargetCarrierRegistry,
  constructSdlcTraversalOverlayCatalog,
  missingSdlcTargetCarrierAdmission,
  requireSdlcTargetCarrierRow,
  resolveSdlcTraversalOverlay,
  sdlcTargetCarrierCandidate,
  sdlcGraphFunctionBoundaryRef,
  sdlcGraphVectorBoundaryRef,
  sdlcPublishedActionRef,
  sdlcPublishedTraversalTargetRef,
  sdlcExecutiveEdgeAccountingRowFor,
  sdlcTraversalOverlayAllowsProductConvergence,
  sdlcTraversalOverlayFailureReentryRoute,
  sdlcTraversalOverlayNextGraphContinuation,
  sdlcTargetOutcomeRef,
  withSdlcOverlayBindingPostActionEvidence,
  type SdlcExecutiveEdgeAccountingRow,
  type SdlcTargetCarrierCandidateAdmission,
  type SdlcTargetCarrierContractRow
} from "../graph/index.js";
import { resolveSdlcTraversalOutcomeClass } from "../contracts/carrier_domain_catalog.js";
import {
  deriveSdlcOperatorAssuranceGate,
  type SdlcOperatorAssuranceGateResult
} from "./assurance_gate.js";
import {
  defaultOperationForTarget,
  hookContractByEdgeName,
  minimalSdlcHookInvocationForContract,
  runSdlcHookTurn,
  type SdlcHookTurnOutcome
} from "../hooks/index.js";
import type { SdlcPublicStartOutcome } from "../start/index.js";
import type {
  SdlcInstalledOperatorStartOutcome,
  SdlcInstalledOperatorStatus,
  SdlcInstalledOperatorTraversalConsequence,
  SdlcOperatorSummary,
  SdlcPostflightGapDossier,
  SdlcPostflightGapReason,
  SdlcPostflightResult,
  SdlcFpEvaluateResult,
  SdlcTraversalObligation,
  SdlcWorkerObligationAssessment,
  SdlcWorkerObligationFulfillmentStatus,
  SdlcWorkerHandoffManifest,
  SdlcDependencyMapNode,
  SdlcDependencyTraversalSelection,
  SdlcFeatureDependencyDag,
  SdlcAbgFrontierCompilation,
  SdlcModuleDependencyMap,
  SdlcTestDependencyMap,
  SdlcWorkerProcessStartedContext,
  SdlcWorkerProcessSummary,
  SdlcWorkerRetryContext,
  SdlcWorkerExecutionEvidence,
  SdlcWorkerResultReport,
  SdlcWorkerRunResult,
  SdlcDecompositionSummary,
  SdlcDesignCompletenessAxisVerdict,
  SdlcDesignCompletenessVerdict,
  SdlcRepairSurfaceTriageCarrier,
  SdlcReviewGradeEdgeFulfillmentAssessment,
  SdlcTraversalHopSelection,
  SdlcTraversalStrategyDecision,
  SdlcTraversalOutcomeClass,
  SdlcWorkerInvocationPackage,
  SdlcWorkerTransportContract
} from "./carriers.js";
import {
  appendOddSdlcRuntimeEvents,
  oddSdlcRuntimeEventsPath
} from "./event_store.js";
import {
  assertCurrentSdlcGtlProgramConformance
} from "../gtl_conformance/program.js";
import {
  deriveSdlcClosureStateTransition,
  makeSdlcClosureResidualPressureCarrier,
  sdlcClosureBlockingReasonRefsForReentry,
  syntheticGapDossierFromClosureRefs,
  syntheticGapDossiersFromClosureDecision
} from "./closure_state_machine.js";
import {
  defaultComputeSubworkstreamManifest,
  SDLC_EVALUATE_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE
} from "./compute_subworkstreams.js";
import {
  deriveWorkerHandoffManifest,
  operatorRunId,
  sha256Text,
  stableOperatorJson,
  tenantToolEnvironmentProjectionFor,
  writeHandoffFiles
} from "./plugins/transform/launch_contract.js";
import {
  snapshotProductMaterializationRoot
} from "./product_materialization/observation.js";
import {
  tenantStackDeclaredMaterializedRoleForRelativePath
} from "./product_materialization/authority.js";
import {
  writeProductMaterializationManifest
} from "./product_materialization/manifest.js";
import {
  deriveSdlcStagedConstructionAuditCarriers,
  type SdlcStagedConstructionAuditCarrier
} from "./product_materialization/staged_authority.js";
import {
  admitWorkerResultReport,
  buildPostTransformWorkerResultReport,
  workerResultReportWithFpStageRefs,
  writeWorkerFpTransformResult
} from "./plugins/transform/result_projection.js";
import {
  componentRepairReentryPlansForGapDossier
} from "./plugins/consequence/repair_reentry.js";
import {
  constructorResultFromWorkerOutput
} from "./plugins/consequence/constructor_projection.js";
import {
  constructPostflightGapDossier,
  gapDossierPathForManifest,
  readPostflightGapDossierRef,
  writePostflightGapDossier
} from "./postflight/gap_dossier.js";
import {
  admittedTestExecutionResultOutput,
  writeDeclaredEdgeProjectionOutput
} from "./plugins/consequence/edge_projection.js";
import {
  sdlcInstalledOperatorProjectsOutput
} from "./edge_output_policy.js";
import { writeSdlcSystemArtifact } from "./system_artifacts.js";
import { sdlcWorkspaceLocalToolEnvironment } from "./tool_environment.js";
import {
  selectSdlcWorkCategoryGovernance
} from "./work_category_governance.js";
import { sdlcOperatorRuntimePolicy } from "./runtime_policy.js";
import {
  createSdlcAbgPluginSet
} from "./plugins/plugin_set.js";
import {
  SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND,
  admitSdlcEvaluateContentRegisterArtifact,
  designDepthContentRegisterProgressAdvanced,
  designDepthContentRegisterProgressSurface,
  designDepthFpEvaluatorContentRegisterPath,
  evaluateSdlcComputeStage,
  observeDesignDepthContentRegisterFirstUpdate,
  observeDesignDepthContentRegisterProgressSnapshot,
  sdlcFpEvaluateOpenObligationPressureRefs,
  writeDesignDepthRegisterProjectionFromEvaluateContentRegister,
  writeSdlcFpEvaluateResult
} from "./plugins/evaluate/index.js";
import {
  DESIGN_DEPTH_FP_EVALUATOR_RULE_OUTCOME_FILE,
  DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
  admitImplementationDesignRegisterCandidateForManifest,
  admitImplementationDesignRegisterForManifest,
  admitImplementationDesignRegisterForRuntimeEvaluation,
  designDepthFpEvaluatorRegisterPath,
  predecessorDesignDepthFpEvaluatorContentRegisterPaths
} from "./plugins/evaluate/design_depth_register.js";
import {
  designDepthFpEvaluatorPromptProjection,
  reviewGradeEdgeFulfillmentPromptProjection
} from "./plugins/evaluate/prompts.js";
import {
  REVIEW_GRADE_EDGE_FULFILLMENT_ASSESSMENT_FILE,
  REVIEW_GRADE_EDGE_FULFILLMENT_RULE_OUTCOME_FILE,
  REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
  admitReviewGradeEdgeFulfillmentAssessmentFromArtifact,
  reviewGradeEdgeFulfillmentAssessmentPressureRefs,
  reviewGradeEdgeFulfillmentAssessmentRequired,
  reviewGradeEdgeFulfillmentRepairSurfaceTriageRows,
  reviewGradeFindingsAreDownstreamStagePressure,
  reviewGradeReadOnlyInputMutationReasons,
  snapshotReviewGradeReadOnlyInputFiles
} from "./review_grade_edge_fulfillment.js";
import {
  SDLC_TICKET_WORKFLOW_FD_RULE_REF,
  sdlcTicketExecutionContractRefs
} from "../tickets/index.js";
import {
  compileSdlcFeatureDependencyDagToAbgFrontier,
  deriveSdlcFeatureDependencyDagFromMaps
} from "./feature_dependency_dag.js";
import {
  constructSdlcLiveFpParallelMaterializationFrontier,
  deriveSdlcLiveFpParallelMaterializationBranchOverrides,
  normalizeSdlcLiveFpParallelMaterializationTarget,
  resolveSdlcLiveFpParallelBatchSize,
  sdlcLiveParallelMaterializationTargetKey,
  type SdlcLiveFpParallelMaterializationBranchRow,
  type SdlcLiveFpParallelMaterializationFanInRow
} from "./live_fp_parallel_materialization_frontier.js";
import { deriveSdlcTraversalHopSelection } from "./traversal_complexity.js";
import {
  admitWorkerTransport,
  constrainClaudeProcessLaunchTools,
  parserForWorkerTransport,
  processLaunchForWorker,
  selectedWorkerExecutorProfile
} from "./transport.js";
import {
  deriveSdlcInstalledQualificationInitialState,
  writeSdlcInstalledQualificationInitialStateArchive
} from "../qualification/index.js";
import {
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveConformProjectManagedTraversalManifest,
  materializeSdlcProjectConformance
} from "../workspace/index.js";
import {
  deriveOddSdlcEvaluateNextReport,
  type OddSdlcEvaluateNextActionInput
} from "../runtime/index.js";
import {
  sdlcSelectedAbgFnCompositionIdentityFromEnginePluginInput,
  type SdlcSelectedAbgFnCompositionIdentity
} from "./composition_identity.js";
import {
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcNextActionProjection,
  constructSdlcOverlaySegmentCompletion,
  constructSdlcConsequenceTraversalActionBinding,
  constructSdlcWorksiteEvidence,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeFulfillmentCountsFromAssessments,
  type SdlcEdgeClosureDisposition,
  type SdlcEdgeFulfillmentCountProjection,
  type SdlcYieldResumeBasis
} from "./traversal_consequence.js";
import {
  admitSdlcEdgeEvidence,
  deriveSdlcEdgeAssuranceCloseDecision,
  deriveSdlcEdgeObligations,
  deriveSdlcEdgeResidualPressure,
  digestSdlcEdgeGainClosureContract,
  measureSdlcEdgeGain,
  resolveSdlcEdgeGainClosureContract,
  sdlcEdgeAssuranceContractRef,
  withAdditionalSdlcEdgeResidualPressureRefs,
  type SdlcEdgeEvidenceCandidate,
  type SdlcEdgeEvidenceSourceKind,
  type SdlcEdgeLedgerInputRef
} from "./edge_gain_closure.js";
import {
  canonicalSdlcPriorGapReasonCode,
  legacyBlockingReasonCode,
  makeSdlcBlockingReason,
  sdlcBlockingReasonFromLegacy,
  summarizeBlockingReasons,
  type SdlcBlockingReason,
  type SdlcBlockingReasonCode,
  type SdlcBlockingReasonLawfulReentryPoint
} from "../shared/blocking_reason.js";
import {
  admitComponentDepthRegisterFromArtifact,
  componentDepthResidualPressureRefs
} from "./component_depth_register.js";
import { admitTestDesignRegisterFromArtifact } from "./test_design_register.js";
import { admitTestExecutionSurfaceRegisterFromArtifact } from "./test_execution_surface_register.js";

export const SDLC_ABG_ATTACHED_FP_MAX_RETRY_ATTEMPTS = 10 as const;

const EMPTY_SCOPE_PATH: readonly string[] = Object.freeze([]);

function isConformProjectGraphVectorEdge(edge: string): boolean {
  if (edge === FG_CONFORM_PROJECT) {
    return true;
  }
  return CONFORM_PROJECT_OUTPUTS.some(
    (targetAssetType) => edge === `${FG_CONFORM_PROJECT}__${targetAssetType}`
  );
}

function summary(input: {
  readonly workspaceRoot: string;
  readonly graphFunctionName: string | null;
  readonly currentEdge: string | null;
  readonly status: SdlcOperatorSummary["status"];
  readonly traversalConsequence?: SdlcInstalledOperatorTraversalConsequence | null;
  readonly blockingReason: string | null;
  readonly blockingReasonCarriers?: readonly SdlcBlockingReason[] | undefined;
  readonly nextLawfulAction: string;
  readonly archiveRoot: string | null;
}): SdlcOperatorSummary {
  const blockingReasons =
    input.blockingReasonCarriers ??
    (input.blockingReason === null
      ? Object.freeze([])
      : Object.freeze([
          sdlcBlockingReasonFromLegacy({ reason: input.blockingReason })
        ]));
  const ledger = input.traversalConsequence?.edgeFulfillmentLedger ?? null;
  const closureDecision = input.traversalConsequence?.edgeClosureDecision ?? null;
  const obligationReview: SdlcOperatorSummary["obligationReview"] =
    ledger === null
      ? Object.freeze({
          status: "not_evaluated",
          expected: 0,
          fulfilled: 0,
          partial: 0,
          blocked: 0,
          unfulfilled: 0,
          missing: 0,
          extra: 0,
          assessmentCount: 0
        })
      : Object.freeze({
          status:
            ledger.counts.blocked > 0 ||
            ledger.counts.partial > 0 ||
            ledger.counts.unfulfilled > 0
              ? "blocked"
              : ledger.counts.missing > 0 || ledger.counts.extra > 0
                ? "incomplete"
                : "passed",
          expected: ledger.counts.expected,
          fulfilled: ledger.counts.fulfilled,
          partial: ledger.counts.partial,
          blocked: ledger.counts.blocked,
          unfulfilled: ledger.counts.unfulfilled,
          missing: ledger.counts.missing,
          extra: ledger.counts.extra,
          assessmentCount: ledger.assessmentCount
        });
  const admittedSemantic: SdlcOperatorSummary["admittedSemantic"] =
    ledger === null || closureDecision === null
      ? Object.freeze({
          status: "not_evaluated",
          targetCarrierAdmissionStatus: null,
          edgeConverged: null,
          closureDisposition: null
        })
      : Object.freeze({
          status:
            ledger.edgeConverged &&
            closureDecision.disposition === "close" &&
            (ledger.targetCarrierAdmissionStatus === "admitted" ||
              ledger.targetCarrierAdmissionStatus === "not_required")
              ? "admitted"
              : "blocked",
          targetCarrierAdmissionStatus: ledger.targetCarrierAdmissionStatus,
          edgeConverged: ledger.edgeConverged,
          closureDisposition: closureDecision.disposition
        });
  return Object.freeze({
    kind: "sdlc_operator_summary",
    workspaceRoot: input.workspaceRoot,
    graphFunctionName: input.graphFunctionName,
    currentEdge: input.currentEdge,
    status: input.status,
    obligationReview,
    admittedSemantic,
    blockingReason: input.blockingReason ?? summarizeBlockingReasons(blockingReasons),
    blockingReasons,
    nextLawfulAction: input.nextLawfulAction,
    archiveRoot: input.archiveRoot
  });
}

function terminalOutcome(input: {
  readonly workspaceRoot: string;
  readonly status: SdlcInstalledOperatorStatus;
  readonly start: SdlcPublicStartOutcome;
  readonly transport: SdlcWorkerTransportContract | null;
  readonly manifest: SdlcWorkerHandoffManifest | null;
  readonly workerRun: SdlcWorkerRunResult | null;
  readonly workerReport: SdlcWorkerResultReport | null;
  readonly postflight: SdlcPostflightResult | null;
  readonly assuranceSatisfaction?: SdlcInstalledOperatorStartOutcome["assuranceSatisfaction"];
  readonly gapDossier: SdlcPostflightGapDossier | null;
  readonly hookOutcome: SdlcHookTurnOutcome | null;
  readonly replayEventCountBefore: number;
  readonly replayEventCountAfter: number;
  readonly emittedRuntimeEventKinds: readonly RuntimeEvent["kind"][];
  readonly archiveRoot: string | null;
  readonly blockingReason: string | null;
  readonly blockingReasonCarriers?: readonly SdlcBlockingReason[] | undefined;
  readonly nextLawfulAction: string;
  readonly currentEdge?: string | null;
  readonly traversalConsequence?: SdlcInstalledOperatorTraversalConsequence | null;
}): SdlcInstalledOperatorStartOutcome {
  const graphFunctionName =
    input.start.executionContract?.targetGraphFunction ?? null;
  return Object.freeze({
    kind: "sdlc_installed_operator_start_outcome",
    status: input.status,
    summary: summary({
      workspaceRoot: input.workspaceRoot,
      graphFunctionName,
      currentEdge: input.currentEdge ?? null,
      status: input.status,
      traversalConsequence: input.traversalConsequence ?? null,
      blockingReason: input.blockingReason,
      blockingReasonCarriers: input.blockingReasonCarriers,
      nextLawfulAction: input.nextLawfulAction,
      archiveRoot: input.archiveRoot
    }),
    start: input.start,
    transport: input.transport,
    manifest: input.manifest,
    workerRun: input.workerRun,
    workerReport: input.workerReport,
    postflight: input.postflight,
    assuranceSatisfaction: input.assuranceSatisfaction ?? null,
    gapDossier: input.gapDossier,
    hookOutcome: input.hookOutcome,
    replayEventCountBefore: input.replayEventCountBefore,
    replayEventCountAfter: input.replayEventCountAfter,
    emittedRuntimeEventKinds: input.emittedRuntimeEventKinds,
    eventLogPath: oddSdlcRuntimeEventsPath(input.workspaceRoot),
    archiveRoot: input.archiveRoot,
    traversalConsequence: input.traversalConsequence ?? null
  });
}

function activePostflightBlockingReasonCarriers(
  postflight: SdlcPostflightResult
): readonly SdlcBlockingReason[] {
  return postflight.status === "passed"
    ? Object.freeze([])
    : postflight.blockingReasonCarriers;
}

function jsonRecord(value: unknown): Readonly<Record<string, unknown>> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.freeze(Object.fromEntries(Object.entries(value)))
    : null;
}

function isStringList(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isSdlcFeatureScopeMode(
  value: unknown
): value is SdlcWorkerInvocationPackage["featureScope"]["mode"] {
  return (
    value === "steel_thread" ||
    value === "targeted_repair" ||
    value === "full_breadth"
  );
}

function readWorkerInvocationPackageFeatureScope(
  value: unknown
): SdlcWorkerInvocationPackage["featureScope"] | null {
  const featureScope = jsonRecord(value);
  if (
    featureScope === null ||
    featureScope["kind"] !== "sdlc_feature_scope" ||
    featureScope["scopeVersion"] !== "ts-scope-v1" ||
    !isSdlcFeatureScopeMode(featureScope["mode"]) ||
    typeof featureScope["scopeRef"] !== "string" ||
    !isStringList(featureScope["basisRefs"]) ||
    !isStringList(featureScope["includedRequirementRefs"]) ||
    !isStringList(featureScope["includedModuleNames"]) ||
    !isStringList(featureScope["includedEntityIds"]) ||
    !isStringList(featureScope["includedOperationIds"]) ||
    !isStringList(featureScope["deferredModuleNames"])
  ) {
    return null;
  }
  return Object.freeze({
    kind: "sdlc_feature_scope",
    scopeVersion: "ts-scope-v1",
    mode: featureScope["mode"],
    scopeRef: featureScope["scopeRef"],
    basisRefs: Object.freeze([...featureScope["basisRefs"]]),
    includedRequirementRefs: Object.freeze([
      ...featureScope["includedRequirementRefs"]
    ]),
    includedModuleNames: Object.freeze([...featureScope["includedModuleNames"]]),
    includedEntityIds: Object.freeze([...featureScope["includedEntityIds"]]),
    includedOperationIds: Object.freeze([...featureScope["includedOperationIds"]]),
    deferredModuleNames: Object.freeze([...featureScope["deferredModuleNames"]])
  });
}

function readWorkerInvocationPackageScope(
  filePath: string
): Pick<
  SdlcWorkerInvocationPackage,
  "kind" | "featureScope" | "inlineObligationIds"
> | null {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }
  try {
    const payload = jsonRecord(JSON.parse(readFileSync(filePath, "utf8")));
    const featureScope = readWorkerInvocationPackageFeatureScope(
      payload?.["featureScope"]
    );
    if (
      payload === null ||
      featureScope === null ||
      payload["kind"] !== "sdlc_worker_invocation_package" ||
      payload["packageVersion"] !== "ts-invocation-v1" ||
      !isStringList(payload["inlineObligationIds"])
    ) {
      return null;
    }
    return Object.freeze({
      kind: "sdlc_worker_invocation_package",
      featureScope,
      inlineObligationIds: Object.freeze([...payload["inlineObligationIds"]])
    });
  } catch {
    return null;
  }
}

function isSdlcPostflightStatus(
  value: unknown
): value is SdlcPostflightResult["status"] {
  return value === "passed" || value === "blocked" || value === "diagnostic";
}

function isSdlcFpEvaluateResultStatus(
  value: unknown
): value is SdlcFpEvaluateResult["status"] {
  return (
    value === "passed" ||
    value === "blocked" ||
    value === "admitted_with_open_obligations"
  );
}

function isFpEvaluateObligationAssessmentCounts(
  value: unknown
): value is SdlcFpEvaluateResult["obligationAssessmentCounts"] {
  const record = jsonRecord(value);
  return (
    record !== null &&
    typeof record["total"] === "number" &&
    Number.isFinite(record["total"]) &&
    typeof record["fulfilled"] === "number" &&
    Number.isFinite(record["fulfilled"]) &&
    typeof record["partial"] === "number" &&
    Number.isFinite(record["partial"]) &&
    typeof record["blocked"] === "number" &&
    Number.isFinite(record["blocked"]) &&
    typeof record["unassessed"] === "number" &&
    Number.isFinite(record["unassessed"])
  );
}

function isSdlcBlockingReason(value: unknown): value is SdlcBlockingReason {
  const record = jsonRecord(value);
  return (
    record !== null &&
    record["kind"] === "sdlc_blocking_reason" &&
    typeof record["code"] === "string" &&
    typeof record["reasonClass"] === "string" &&
    typeof record["lawfulReentryPoint"] === "string" &&
    typeof record["message"] === "string" &&
    (record["detail"] === null || typeof record["detail"] === "string") &&
    isStringList(record["evidenceRefs"])
  );
}

function readReviewGradePostflightForManifest(
  manifest: SdlcWorkerHandoffManifest
): SdlcPostflightResult | null {
  const filePath = join(manifest.archiveRoot, "review_grade_postflight.json");
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const payload = jsonRecord(JSON.parse(readFileSync(filePath, "utf8")));
    if (payload === null) {
      return null;
    }
    if (
      payload["kind"] !== "sdlc_operator_postflight_result" ||
      !isStringList(payload["blockingReasons"]) ||
      !Array.isArray(payload["blockingReasonCarriers"]) ||
      !payload["blockingReasonCarriers"].every(isSdlcBlockingReason) ||
      !isStringList(payload["evidenceRefs"]) ||
      !isSdlcPostflightStatus(payload["status"])
    ) {
      return null;
    }
    return Object.freeze({
      kind: "sdlc_operator_postflight_result" as const,
      status: payload["status"],
      blockingReasons: Object.freeze([...payload["blockingReasons"]]),
      blockingReasonCarriers: Object.freeze([
        ...payload["blockingReasonCarriers"]
      ]),
      evidenceRefs: Object.freeze([...payload["evidenceRefs"]])
    });
  } catch {
    return null;
  }
}

function stateWithReviewGradePostflight(
  state: SdlcAbgOwnedFpDispatchState
): SdlcAbgOwnedFpDispatchState {
  const reviewGradePostflight = readReviewGradePostflightForManifest(
    state.manifest
  );
  if (reviewGradePostflight === null || reviewGradePostflight.status === "passed") {
    return state;
  }
  const blockingReasonCarriers = Object.freeze([
    ...activePostflightBlockingReasonCarriers(reviewGradePostflight),
    ...state.blockingReasonCarriers
  ]);
  return Object.freeze({
    ...state,
    postflight: reviewGradePostflight,
    blockingReason: summarizeBlockingReasons(blockingReasonCarriers),
    blockingReasonCarriers
  });
}

export type SdlcWorkerRetryContextDerivationStatus =
  | "ready"
  | "no_consequence"
  | "no_manifest"
  | "no_executable_intent";

export interface SdlcWorkerRetryContextDerivation {
  readonly kind: "sdlc_worker_retry_context_derivation";
  readonly status: SdlcWorkerRetryContextDerivationStatus;
  readonly retryContext: SdlcWorkerRetryContext | null;
  readonly reasonRef: string;
  readonly sourceProjectionRef: string | null;
}

export function deriveSdlcWorkerRetryContextFromTraversalConsequence(input: {
  readonly outcome: SdlcInstalledOperatorStartOutcome;
  readonly attemptIndex: number;
}): SdlcWorkerRetryContextDerivation {
  const consequence = input.outcome.traversalConsequence;
  if (consequence === null) {
    return Object.freeze({
      kind: "sdlc_worker_retry_context_derivation" as const,
      status: "no_consequence" as const,
      retryContext: null,
      reasonRef: "retry-context-unavailable://odd-sdlc/no-consequence",
      sourceProjectionRef: null
    });
  }
  const sourceProjectionRef =
    consequence.nextActionProjection.nextActionProjectionRef;
  if (input.outcome.manifest === null) {
    return Object.freeze({
      kind: "sdlc_worker_retry_context_derivation" as const,
      status: "no_manifest" as const,
      retryContext: null,
      reasonRef: "retry-context-unavailable://odd-sdlc/no-manifest",
      sourceProjectionRef
    });
  }
  if (consequence.nextActionProjection.choosesNextTraversal !== true) {
    return Object.freeze({
      kind: "sdlc_worker_retry_context_derivation" as const,
      status: "no_executable_intent" as const,
      retryContext: null,
      reasonRef: "retry-context-unavailable://odd-sdlc/no-executable-intent",
      sourceProjectionRef
    });
  }
  const archivedGapDossier =
    input.outcome.gapDossier === null
      ? archivedGapDossierForManifest(input.outcome.manifest)
      : null;
  const priorGapDossiers =
    input.outcome.gapDossier === null
      ? archivedGapDossier === null
        ? syntheticGapDossiersFromClosureDecision({
            manifest: input.outcome.manifest,
            edgeClosureDecision:
              input.outcome.traversalConsequence?.edgeClosureDecision ?? null,
            sourceProjectionRef
          })
        : Object.freeze([archivedGapDossier])
      : Object.freeze([input.outcome.gapDossier]);
  const priorAuthorityRef =
    priorGapDossiers[0]?.currentGapDossierRef ??
    consequence.edgeClosureDecision.decisionRef;
  const manifestRef = pathToFileURL(
    join(input.outcome.manifest.archiveRoot, "handoff_manifest.json")
  ).href;
  const refSegment = encodeURIComponent(sourceProjectionRef);
  const retryContext = Object.freeze({
    kind: "sdlc_worker_retry_context",
    retryAttemptRefs: Object.freeze([
      Object.freeze({
        vectorIndex: input.outcome.manifest.vectorIndex,
        retryRunId: `retry-run://odd-sdlc-ts/installed-reentry/${refSegment}/${input.attemptIndex}`,
        retryCallId: `retry-call://odd-sdlc-ts/installed-reentry/${refSegment}/${input.attemptIndex}`,
        manifestId: manifestRef,
        priorAuthorityRef,
        attemptIndex: input.attemptIndex,
        sourceProjectionRef
      })
    ]),
    priorGapDossiers
  });
  return Object.freeze({
    kind: "sdlc_worker_retry_context_derivation" as const,
    status: "ready" as const,
    retryContext,
    reasonRef: "retry-context://odd-sdlc/ready",
    sourceProjectionRef
  });
}

function archivedGapDossierForManifest(
  manifest: SdlcWorkerHandoffManifest
): SdlcPostflightGapDossier | null {
  const filePath = gapDossierPathForManifest(manifest);
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const dossier = readPostflightGapDossierRef(pathToFileURL(filePath).href);
    if (
      dossier === null ||
      dossier.edgeName !== manifest.edgeName ||
      dossier.vectorIndex !== manifest.vectorIndex ||
      dossier.targetAssetType !== manifest.targetAssetType ||
      dossier.retryEligible !== true ||
      dossier.reasons.length === 0
    ) {
      return null;
    }
    return dossier;
  } catch {
    return null;
  }
}

function vectorEvaluatorNames(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
}): readonly string[] {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("Installed operator vector index outside basis");
  }
  return Object.freeze(vector.evaluators.map((evaluator) => evaluator.name));
}

function compactSdlcPriorGapReasonForRetryContext(
  reason: SdlcPostflightGapReason,
  currentGapDossierRef: string
): SdlcPostflightGapReason {
  const canonicalReason = canonicalSdlcPriorGapReasonCode(reason.reason);
  return Object.freeze({
    ...reason,
    reason: canonicalReason,
    blockingReason: makeSdlcBlockingReason({
      code: reason.blockingReason.code,
      detail:
        reason.blockingReason.code === "edge_closure_residual_pressure"
          ? canonicalReason
          : reason.blockingReason.detail,
      reasonClass: reason.blockingReason.reasonClass,
      lawfulReentryPoint: reason.blockingReason.lawfulReentryPoint,
      message: reason.blockingReason.message,
      evidenceRefs: [currentGapDossierRef]
    })
  });
}

function compactSdlcPriorGapReasonKey(reason: SdlcPostflightGapReason): string {
  return [
    reason.reason,
    reason.blockingReason.code,
    reason.blockingReason.detail ?? "",
    reason.blockingReason.reasonClass,
    reason.blockingReason.lawfulReentryPoint
  ].join("\u001f");
}

export function compactSdlcPriorGapDossiersForRetryContext(
  dossiers: readonly SdlcPostflightGapDossier[]
): readonly SdlcPostflightGapDossier[] {
  if (dossiers.length <= 1) {
    return Object.freeze([...dossiers]);
  }
  const refs = uniqueSorted(dossiers.map((dossier) => dossier.currentGapDossierRef));
  const latest = preferredWorkerFacingGapDossierForRetryContext(dossiers);
  if (latest === undefined) {
    return Object.freeze([]);
  }
  const latestReasonByKey = new Map<string, SdlcPostflightGapReason>();
  for (const reason of latest.reasons) {
    const compactReason = compactSdlcPriorGapReasonForRetryContext(
      reason,
      latest.currentGapDossierRef
    );
    latestReasonByKey.set(compactSdlcPriorGapReasonKey(compactReason), compactReason);
  }
  const compact: SdlcPostflightGapDossier = Object.freeze({
    kind: latest.kind,
    status: latest.status,
    graphFunctionName: latest.graphFunctionName,
    edgeName: latest.edgeName,
    vectorIndex: latest.vectorIndex,
    targetAssetType: latest.targetAssetType,
    reasons: Object.freeze(
      [...latestReasonByKey.values()].sort(
        (left, right) =>
          left.reason.localeCompare(right.reason) ||
          (left.blockingReason.detail ?? "").localeCompare(
            right.blockingReason.detail ?? ""
          ) ||
          left.blockingReason.code.localeCompare(right.blockingReason.code)
      )
    ),
    evidenceRefs: refs,
    priorManifestId: latest.priorManifestId,
    currentGapDossierRef: latest.currentGapDossierRef,
    retryEligible: latest.retryEligible,
    nextLawfulActions: latest.nextLawfulActions
  });
  return Object.freeze([
    compact
  ]);
}

function workerFacingGapDossierIsOnlyRuntimeProcessFailure(
  dossier: SdlcPostflightGapDossier
): boolean {
  return (
    dossier.reasons.length > 0 &&
    dossier.reasons.every(
      (reason) =>
        reason.reasonClass === "worker_runtime" &&
        (
          reason.blockingReason.code === "worker_process_failed" ||
          reason.blockingReason.code === "worker_connection_failed" ||
          reason.blockingReason.code === "worker_hard_timeout" ||
          reason.blockingReason.code === "silent_worker_inactivity" ||
          reason.blockingReason.code === "worker_lost_terminal" ||
          reason.blockingReason.code === "worker_process_error"
        )
    )
  );
}

function preferredWorkerFacingGapDossierForRetryContext(
  dossiers: readonly SdlcPostflightGapDossier[]
): SdlcPostflightGapDossier | undefined {
  const latest = dossiers[dossiers.length - 1];
  if (
    latest === undefined ||
    !workerFacingGapDossierIsOnlyRuntimeProcessFailure(latest)
  ) {
    return latest;
  }
  return [...dossiers]
    .reverse()
    .find(
      (dossier) =>
        dossier.edgeName === latest.edgeName &&
        dossier.targetAssetType === latest.targetAssetType &&
        dossier.vectorIndex === latest.vectorIndex &&
        !workerFacingGapDossierIsOnlyRuntimeProcessFailure(dossier)
    ) ?? latest;
}

function gapDossiersFromEvidenceRefs(
  refs: readonly string[]
): readonly SdlcPostflightGapDossier[] {
  return compactSdlcPriorGapDossiersForRetryContext(
    refs
      .map((ref) => readPostflightGapDossierRef(ref))
      .filter((dossier): dossier is SdlcPostflightGapDossier => dossier !== null)
  );
}

function priorAuthorityRefForAbgRetryRow(
  row: FreshRetryContextProjection["selectedRows"][number]
): string {
  return (
    row.evidenceRefs.find((ref) => readPostflightGapDossierRef(ref) !== null) ??
    row.priorManifestId ??
    row.evidenceRefs[0] ??
    row.rowId
  );
}

export function sdlcWorkerRetryContextFromAbgRetryContext(
  projection: FreshRetryContextProjection
): SdlcWorkerRetryContext {
  if (projection.status !== "fresh") {
    throw new TypeError(
      `ABG retry context projection is not fresh: ${projection.status}`
    );
  }
  if (
    projection.frontier.rows.length > 0 &&
    projection.selectedRows.length === 0
  ) {
    throw new TypeError(
      "ABG retry context projection has frontier rows but no selected retry rows"
    );
  }
  const retryAttemptRefs = Object.freeze(
    projection.selectedRows.flatMap((row) => {
      if (
        row.retryRunId === null ||
        row.manifestId === null ||
        row.attemptIndex === null
      ) {
        return [];
      }
      return [
        Object.freeze({
          vectorIndex: row.vectorIndex,
          retryRunId: row.retryRunId,
          retryCallId: row.rowId,
          manifestId: row.manifestId,
          priorAuthorityRef: priorAuthorityRefForAbgRetryRow(row),
          attemptIndex: row.attemptIndex,
          sourceProjectionRef: projection.replayFrontierRef
        })
      ];
    })
  );
  const evidenceRefs = uniqueSorted([
    ...projection.selectedEvidenceRefs,
    ...projection.selectedRows.flatMap((row) => [
      ...row.evidenceRefs,
      row.priorManifestId ?? ""
    ])
  ]);
  return Object.freeze({
    kind: "sdlc_worker_retry_context",
    retryAttemptRefs,
    priorGapDossiers: gapDossiersFromEvidenceRefs(evidenceRefs)
  });
}

function decodedRefForScope(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function decodedArchiveRefForScope(input: string): string {
  let decoded = input;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const next = decodedRefForScope(decoded);
    if (next === decoded) {
      return decoded;
    }
    decoded = next;
  }
  return decoded;
}

function postActionProjectionHasExplicitFeatureScope(input: {
  readonly nextActionProjectionRef: string;
  readonly selectedActionRef: string;
}): boolean {
  const refs = [
    input.nextActionProjectionRef,
    input.selectedActionRef
  ].map(decodedRefForScope);
  return refs.some((ref) =>
    /(?:\/module\/|\/scope\/|post_deferred_scope_product_materialization\/)[A-Za-z0-9._-]+/u.test(
      ref
    )
  );
}

function postActionProjectionCarriesRetryContext(input: {
  readonly nextActionProjection: NonNullable<
    SdlcPublicStartOutcome["executionContract"]
  >["nextActionProjection"];
}): boolean {
  return (
    input.nextActionProjection.gapPressureRefs.length > 0 ||
    (input.nextActionProjection.selectedActionRef?.includes(
      "/post_repair_reentry/"
    ) ?? false) ||
    postActionProjectionHasExplicitFeatureScope({
      nextActionProjectionRef: input.nextActionProjection.nextActionProjectionRef,
      selectedActionRef: input.nextActionProjection.selectedActionRef ?? ""
    })
  );
}

const POST_ACTION_GAP_PRESSURE_PREFIX = "pressure://odd-sdlc/post-action/";

function postActionArchiveRefFromGapPressureRef(ref: string): string | null {
  if (!ref.startsWith(POST_ACTION_GAP_PRESSURE_PREFIX)) {
    return null;
  }
  const remainder = ref.slice(POST_ACTION_GAP_PRESSURE_PREFIX.length);
  const separator = remainder.lastIndexOf("/");
  if (separator <= 0) {
    return null;
  }
  const decoded = decodedRefForScope(remainder.slice(0, separator));
  return decoded.startsWith("file://") ? decoded : null;
}

function postActionArchiveRefFromSelectedActionRef(ref: string | null): string | null {
  if (ref === null || !ref.includes("/post_repair_reentry/")) {
    return null;
  }
  const encodedArchiveRef = ref.split("/").at(-1);
  if (encodedArchiveRef === undefined || encodedArchiveRef.length === 0) {
    return null;
  }
  const decoded = decodedArchiveRefForScope(encodedArchiveRef);
  return decoded.startsWith("file://") ? decoded : null;
}

function syntheticClosureGapDossierFromArchiveRoot(
  archiveRoot: string,
  sourceProjectionRef: string
): SdlcPostflightGapDossier | null {
  try {
    const handoff = jsonRecord(JSON.parse(
      readFileSync(join(archiveRoot, "handoff_manifest.json"), "utf8")
    ));
    const closure = jsonRecord(JSON.parse(
      readFileSync(join(archiveRoot, "sdlc_edge_closure_decision.json"), "utf8")
    ));
    if (handoff === null || closure === null) {
      return null;
    }
    if (
      closure["disposition"] === "close" ||
      typeof closure["decisionRef"] !== "string" ||
      !isStringList(closure["reasonRefs"]) ||
      typeof handoff["archiveRoot"] !== "string" ||
      typeof handoff["edgeName"] !== "string" ||
      typeof handoff["graphFunctionName"] !== "string" ||
      typeof handoff["targetAssetType"] !== "string" ||
      typeof handoff["vectorIndex"] !== "number"
    ) {
      return null;
    }
    return syntheticGapDossierFromClosureRefs({
      manifest: {
        archiveRoot: handoff["archiveRoot"],
        edgeName: handoff["edgeName"],
        graphFunctionName: handoff["graphFunctionName"],
        targetAssetType: handoff["targetAssetType"],
        vectorIndex: handoff["vectorIndex"]
      },
      decisionRef: closure["decisionRef"],
      reasonRefs: closure["reasonRefs"],
      sourceProjectionRef
    });
  } catch {
    return null;
  }
}

function gapDossierFromPostActionArchiveRef(
  archiveRef: string
): SdlcPostflightGapDossier | null {
  try {
    const archivePath = fileURLToPath(archiveRef);
    const archiveRoot = archivePath.endsWith("/general")
      ? dirname(archivePath)
      : archivePath;
    const gapDossier = readPostflightGapDossierRef(
      pathToFileURL(join(archiveRoot, "gap_dossier.json")).href
    );
    if (gapDossier !== null) {
      return gapDossier;
    }
    return syntheticClosureGapDossierFromArchiveRoot(
      archiveRoot,
      pathToFileURL(join(archiveRoot, "sdlc_next_action_projection.json")).href
    );
  } catch {
    return null;
  }
}

function postActionGapDossiersFromProjection(input: {
  readonly nextActionProjection: NonNullable<
    SdlcPublicStartOutcome["executionContract"]
  >["nextActionProjection"];
}): readonly SdlcPostflightGapDossier[] {
  const byRef = new Map<string, SdlcPostflightGapDossier>();
  const selectedArchiveRef = postActionArchiveRefFromSelectedActionRef(
    input.nextActionProjection.selectedActionRef
  );
  if (selectedArchiveRef !== null) {
    const dossier = gapDossierFromPostActionArchiveRef(selectedArchiveRef);
    if (dossier !== null) {
      byRef.set(dossier.currentGapDossierRef, dossier);
    }
  }
  for (const pressureRef of input.nextActionProjection.gapPressureRefs) {
    const archiveRef = postActionArchiveRefFromGapPressureRef(pressureRef);
    if (archiveRef === null) {
      continue;
    }
    const dossier = gapDossierFromPostActionArchiveRef(archiveRef);
    if (dossier !== null) {
      byRef.set(dossier.currentGapDossierRef, dossier);
    }
  }
  return compactSdlcPriorGapDossiersForRetryContext(
    [...byRef.values()].filter((dossier) => dossier.retryEligible === true)
  );
}

export function deriveSdlcWorkerRetryContextFromPostActionProjection(input: {
  readonly nextActionProjection: NonNullable<
    SdlcPublicStartOutcome["executionContract"]
  >["nextActionProjection"];
  readonly vectorIndex: number;
}): SdlcWorkerRetryContext | undefined {
  if (
    input.nextActionProjection.nextActionBasisKind === "initial_selection" ||
    input.nextActionProjection.choosesNextTraversal !== true ||
    input.nextActionProjection.selectedActionRef === null
  ) {
    return undefined;
  }
  if (!postActionProjectionCarriesRetryContext(input)) {
    return undefined;
  }
  const priorGapDossiers = postActionGapDossiersFromProjection({
    nextActionProjection: input.nextActionProjection
  });
  const priorAuthorityRef =
    priorGapDossiers[0]?.currentGapDossierRef ??
    input.nextActionProjection.selectedActionRef;
  return Object.freeze({
    kind: "sdlc_worker_retry_context" as const,
    retryAttemptRefs: Object.freeze([
      Object.freeze({
        vectorIndex: input.vectorIndex,
        retryRunId: "post-action-reentry",
        retryCallId: input.nextActionProjection.nextActionProjectionRef,
        manifestId: input.nextActionProjection.nextActionProjectionRef,
        priorAuthorityRef,
        attemptIndex: 0,
        sourceProjectionRef: input.nextActionProjection.nextActionProjectionRef
      })
    ]),
    priorGapDossiers
  });
}

function mergedRetryContext(input: {
  readonly projected: SdlcWorkerRetryContext;
  readonly override: SdlcWorkerRetryContext | undefined;
  readonly vectorIndex: number;
}): SdlcWorkerRetryContext {
  if (input.override === undefined) {
    return input.projected;
  }
  const overrideAttemptRefs = input.override.retryAttemptRefs.filter(
    (ref) => ref.vectorIndex === input.vectorIndex
  );
  const overrideDossiers = input.override.priorGapDossiers.filter(
    (dossier) =>
      dossier.vectorIndex === input.vectorIndex ||
      dossier.reasons.some(
        (reason) =>
          reason.blockingReason.lawfulReentryPoint === "repair_worker_output"
      )
  );
  if (overrideAttemptRefs.length === 0 && overrideDossiers.length === 0) {
    return input.projected;
  }
  const attemptRefByKey = new Map<
    string,
    SdlcWorkerRetryContext["retryAttemptRefs"][number]
  >();
  for (const ref of [
    ...input.projected.retryAttemptRefs,
    ...overrideAttemptRefs
  ]) {
    attemptRefByKey.set(
      `${ref.vectorIndex}:${ref.priorAuthorityRef}:${ref.attemptIndex}`,
      ref
    );
  }
  const dossierByRef = new Map<string, SdlcPostflightGapDossier>();
  for (const dossier of [
    ...input.projected.priorGapDossiers,
    ...overrideDossiers
  ]) {
    dossierByRef.set(dossier.currentGapDossierRef, dossier);
  }
  return Object.freeze({
    kind: "sdlc_worker_retry_context",
    retryAttemptRefs: Object.freeze([...attemptRefByKey.values()]),
    priorGapDossiers: Object.freeze([...dossierByRef.values()])
  });
}

function latestRuntimeGapDossierForRetryContext(input: {
  readonly workspaceRoot: string;
  readonly vectorIndex: number;
  readonly edgeName: string;
  readonly targetAssetType: string;
}): SdlcPostflightGapDossier | null {
  const operatorRunsRoot = join(
    input.workspaceRoot,
    deriveSdlcConformProjectProfileFromWorkspace(input.workspaceRoot).runtimeLayout
      .operatorRunRoot
  );
  if (!existsSync(operatorRunsRoot) || !statSync(operatorRunsRoot).isDirectory()) {
    return null;
  }
  const candidates: SdlcPostflightGapDossier[] = [];
  const runIds = readdirSync(operatorRunsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const runId of runIds) {
    const archiveRoot = join(operatorRunsRoot, runId);
    const gapDossierRef = pathToFileURL(join(archiveRoot, "gap_dossier.json")).href;
    const dossier =
      readPostflightGapDossierRef(gapDossierRef) ??
      syntheticClosureGapDossierFromArchiveRoot(
        archiveRoot,
        pathToFileURL(join(archiveRoot, "sdlc_next_action_projection.json")).href
      );
    if (
      dossier !== null &&
      dossier.vectorIndex === input.vectorIndex &&
      dossier.edgeName === input.edgeName &&
      dossier.targetAssetType === input.targetAssetType
    ) {
      candidates.push(dossier);
    }
  }
  return preferredWorkerFacingGapDossierForRetryContext(candidates) ?? null;
}

function retryContextCarriesGapAuthority(
  retryContext: SdlcWorkerRetryContext
): boolean {
  return (
    retryContext.priorGapDossiers.length > 0 ||
    retryContext.retryAttemptRefs.some((ref) => {
      const priorAuthorityRef = decodedArchiveRefForScope(ref.priorAuthorityRef);
      return (
        priorAuthorityRef.startsWith("closure-gap-dossier://") ||
        priorAuthorityRef.startsWith("gap-dossier://") ||
        priorAuthorityRef.startsWith("gap://") ||
        /(?:^|\/)gap_dossier\.json(?:$|[?#])/u.test(priorAuthorityRef)
      );
    })
  );
}

function operatorRunIdFromRef(ref: string): string | null {
  const decoded = decodedArchiveRefForScope(ref);
  const match = decoded.match(/\/operator-runs\/([^/?#:]+)/u);
  return match?.[1] ?? null;
}

function operatorRunIdsFromRetryContext(
  retryContext: SdlcWorkerRetryContext
): readonly string[] {
  return uniqueSorted(
    retryContext.retryAttemptRefs.flatMap((ref) =>
      [
        ref.retryCallId,
        ref.manifestId,
        ref.priorAuthorityRef,
        ref.sourceProjectionRef
      ].flatMap((candidate) => {
        const runId = operatorRunIdFromRef(candidate);
        return runId === null ? [] : [runId];
      })
    )
  );
}

function operatorRunIdsFromGapDossier(
  dossier: SdlcPostflightGapDossier
): readonly string[] {
  return uniqueSorted(
    [
      dossier.currentGapDossierRef,
      dossier.priorManifestId,
      ...dossier.evidenceRefs,
      ...dossier.reasons.flatMap((reason) => [
        ...reason.blockingReason.evidenceRefs,
        reason.blockingReason.detail ?? ""
      ])
    ].flatMap((ref) => {
      const runId = operatorRunIdFromRef(ref);
      return runId === null ? [] : [runId];
    })
  );
}

function retryContextReferencesRuntimeAttemptForGap(input: {
  readonly retryContext: SdlcWorkerRetryContext;
  readonly gapDossier: SdlcPostflightGapDossier;
}): boolean {
  const gapRunIds = operatorRunIdsFromGapDossier(input.gapDossier);
  const latestGapRunId = gapRunIds[gapRunIds.length - 1];
  if (latestGapRunId === undefined) {
    return false;
  }
  return operatorRunIdsFromRetryContext(input.retryContext).some(
    (runId) => runId <= latestGapRunId
  );
}

function gapDossierHasComponentRepairSchedulePressure(
  dossier: SdlcPostflightGapDossier
): boolean {
  return (
    dossier.targetAssetType === "component_repair_schedule_surface" &&
    dossier.reasons.some(
      (reason) =>
        reason.reason === "component_repair_schedule_repair_required" ||
        reason.reason.startsWith("component_repair_row_open:")
    )
  );
}

function currentComponentTestQualificationClearsRepairPressure(
  workspaceRoot: string
): boolean {
  let selectedOutputRoot: string;
  try {
    selectedOutputRoot =
      deriveSdlcConformProjectProfileFromWorkspace(workspaceRoot).selectedOutputRoot;
  } catch {
    return false;
  }
  const outputFile = join(
    workspaceRoot,
    selectedOutputRoot,
    "design/component_test_qualification_surface.md"
  );
  if (!existsSync(outputFile) || !statSync(outputFile).isFile()) {
    return false;
  }
  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_test_qualification_surface",
    outputFile
  });
  if (admission.status !== "admitted" || admission.register === null) {
    return false;
  }
  const register = admission.register;
  return (
    register.componentExecutionFailureRegister === null &&
    register.componentTestQualificationRows.length > 0 &&
    register.componentTestQualificationRows.every(
      (row) => row.status === "passed"
    )
  );
}

function gapDossierSupersededByCurrentWorkspace(input: {
  readonly workspaceRoot: string;
  readonly dossier: SdlcPostflightGapDossier;
}): boolean {
  return (
    gapDossierHasComponentRepairSchedulePressure(input.dossier) &&
    currentComponentTestQualificationClearsRepairPressure(input.workspaceRoot)
  );
}

function retryContextWithoutSupersededGapDossiers(input: {
  readonly retryContext: SdlcWorkerRetryContext;
  readonly workspaceRoot: string;
}): SdlcWorkerRetryContext {
  const priorGapDossiers = input.retryContext.priorGapDossiers.filter(
    (dossier) =>
      !gapDossierSupersededByCurrentWorkspace({
        workspaceRoot: input.workspaceRoot,
        dossier
      })
  );
  if (priorGapDossiers.length === input.retryContext.priorGapDossiers.length) {
    return input.retryContext;
  }
  return Object.freeze({
    ...input.retryContext,
    priorGapDossiers: Object.freeze(priorGapDossiers)
  });
}

export function mergeSdlcWorkerRetryContextWithRuntimeGapRegister(input: {
  readonly projected: SdlcWorkerRetryContext;
  readonly workspaceRoot: string;
  readonly vectorIndex: number;
  readonly edgeName: string;
  readonly targetAssetType: string;
}): SdlcWorkerRetryContext {
  const projected = retryContextWithoutSupersededGapDossiers({
    retryContext: input.projected,
    workspaceRoot: input.workspaceRoot
  });
  const latestGapDossier = latestRuntimeGapDossierForRetryContext(input);
  if (latestGapDossier === null || latestGapDossier.retryEligible !== true) {
    return projected;
  }
  if (
    gapDossierSupersededByCurrentWorkspace({
      workspaceRoot: input.workspaceRoot,
      dossier: latestGapDossier
    })
  ) {
    return projected;
  }
  const projectedReferencesRuntimeAttempt = retryContextReferencesRuntimeAttemptForGap({
    retryContext: projected,
    gapDossier: latestGapDossier
  });
  if (
    !retryContextCarriesGapAuthority(projected) &&
    (projected.retryAttemptRefs.length === 0 ||
      (!latestGapDossier.currentGapDossierRef.startsWith(
        "closure-gap-dossier://"
      ) &&
        !projectedReferencesRuntimeAttempt))
  ) {
    return projected;
  }
  if (
    projected.priorGapDossiers.some((dossier) =>
      dossier.reasons.some(
        (reason) =>
          reason.blockingReason.lawfulReentryPoint === "repair_worker_output"
      )
    )
  ) {
    return projected;
  }
  const dossierByRef = new Map<string, SdlcPostflightGapDossier>();
  for (const dossier of [
    ...projected.priorGapDossiers,
    latestGapDossier
  ]) {
    dossierByRef.set(dossier.currentGapDossierRef, dossier);
  }
  return Object.freeze({
    ...projected,
    priorGapDossiers: compactSdlcPriorGapDossiersForRetryContext([
      ...dossierByRef.values()
    ])
  });
}

function vectorIndexByEdgeName(input: {
  readonly basis: ExecutionBasis;
  readonly edgeName: string;
}): number | null {
  const index = input.basis.graph.vectors.findIndex(
    (vector) =>
      vector.name === input.edgeName ||
      sdlcGraphVectorBoundaryRef(vector) === input.edgeName
  );
  return index < 0 ? null : index;
}

interface GraphContinuationReplayCursor {
  readonly replayEvents: readonly RuntimeEvent[];
  readonly cursorEvents: readonly RuntimeEvent[];
}

function collectAbgAuthoredRuntimeEvent(_event: CanonicalRuntimeEvent): void {
  // The ABG route returns emitted events; SDLC persists them through its append sink.
  void _event;
}

function replayEventVectorClosureKey(
  event: RuntimeEvent
): string | null {
  if (event.kind !== "vector_closed") {
    return null;
  }
  return JSON.stringify({
    basisId: event.basisId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    vectorIndex: event.vectorIndex,
    edge: event.edge
  });
}

function replayEventsWithoutDuplicateVectorClosures(
  replayEvents: readonly RuntimeEvent[]
): readonly RuntimeEvent[] {
  const seen = new Set<string>();
  const filtered: RuntimeEvent[] = [];
  for (const event of replayEvents) {
    const key = replayEventVectorClosureKey(event);
    if (key !== null) {
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
    }
    filtered.push(event);
  }
  return filtered.length === replayEvents.length
    ? replayEvents
    : Object.freeze(filtered);
}

function replayEventsWithGraphContinuationCursor(input: {
  readonly basis: ExecutionBasis;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly nextGraphVectorRef: string | null;
}): GraphContinuationReplayCursor {
  const replayEvents = replayEventsWithoutDuplicateVectorClosures(input.replayEvents);
  if (input.nextGraphVectorRef === null) {
    return Object.freeze({
      replayEvents,
      cursorEvents: Object.freeze([])
    });
  }
  const targetIndex = vectorIndexByEdgeName({
    basis: input.basis,
    edgeName: input.nextGraphVectorRef
  });
  if (targetIndex === null || targetIndex <= 0) {
    return Object.freeze({
      replayEvents,
      cursorEvents: Object.freeze([])
    });
  }
  const cursor = applyExplicitGraphVectorResumeCursor({
    basis: input.basis,
    runtimeEvents: replayEvents,
    eventSink: collectAbgAuthoredRuntimeEvent,
    targetVectorIndex: targetIndex,
    reason: "odd_sdlc_post_close_graph_continuation_cursor",
    causationEventRefs: Object.freeze([input.nextGraphVectorRef])
  });
  return Object.freeze({
    replayEvents: cursor.replayEvents,
    cursorEvents: cursor.emittedEvents
  });
}

function vectorNodeRefFor(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly role: "source" | "target";
}): string {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError(`missing vector ${input.vectorIndex}`);
  }
  const node = input.role === "source" ? vector.source[0] : vector.target;
  if (node === undefined) {
    throw new TypeError(`missing ${input.role} node for vector ${input.vectorIndex}`);
  }
  return node.id;
}

function vectorRangeInclusive(start: number, end: number): readonly number[] {
  const indexes: number[] = [];
  for (let index = start; index <= end; index += 1) {
    indexes.push(index);
  }
  return Object.freeze(indexes);
}

function graphSpanRefForOperatorReentry(input: {
  readonly basis: ExecutionBasis;
  readonly sourceVectorIndex: number;
  readonly terminalVectorIndex: number;
  readonly scope: string;
}) {
  return Object.freeze({
    kind: "graph_span_ref" as const,
    spanId:
      `graph-span:odd-sdlc-${input.scope}:${input.basis.id}:` +
      `${input.sourceVectorIndex}->${input.terminalVectorIndex}`,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    sourceVectorIndex: input.sourceVectorIndex,
    terminalVectorIndex: input.terminalVectorIndex,
    sourceNodeRef: vectorNodeRefFor({
      basis: input.basis,
      vectorIndex: input.sourceVectorIndex,
      role: "source"
    }),
    terminalNodeRef: vectorNodeRefFor({
      basis: input.basis,
      vectorIndex: input.terminalVectorIndex,
      role: "target"
    }),
    coveredVectorIndexes: vectorRangeInclusive(
      input.sourceVectorIndex,
      input.terminalVectorIndex
    )
  });
}

function repairReentryGraphSpanRuntimeEvents(input: {
  readonly basis: ExecutionBasis;
  readonly outcome: SdlcAbgOwnedFpDispatchState;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly emittedEvents: readonly RuntimeEvent[];
}): readonly RuntimeEvent[] {
  const dossier = input.outcome.gapDossier;
  if (
    dossier === null ||
    sdlcClosureBlockingReasonRefsForReentry({
      runRef: manifestRefSegment(input.outcome.manifest),
      scope: "state",
      blockingReasonCarriers: input.outcome.blockingReasonCarriers,
      reentryPoint: "repair_worker_output"
    }).length === 0
  ) {
    return Object.freeze([]);
  }
  const plans = componentRepairReentryPlansForGapDossier({
    manifest: input.outcome.manifest,
    dossier
  });
  const targetedPlans = plans
    .map((plan) =>
      Object.freeze({
        plan,
        targetVectorIndex: vectorIndexByEdgeName({
          basis: input.basis,
          edgeName: plan.targetEdgeName
        })
      })
    )
    .filter(
      (
        entry
      ): entry is {
        readonly plan: (typeof plans)[number];
        readonly targetVectorIndex: number;
      } => entry.targetVectorIndex !== null
    );
  if (targetedPlans.length === 0) {
    return Object.freeze([]);
  }
  const terminalVectorIndex = input.outcome.manifest.vectorIndex;
  const targetVectorIndex = Math.min(
    ...targetedPlans.map((entry) => entry.targetVectorIndex)
  );
  if (targetVectorIndex > terminalVectorIndex) {
    return Object.freeze([]);
  }
  const generation =
    input.replayEvents.filter((event) => event.kind === "graph_span_foldback_evaluated")
      .length + 1;
  const span = graphSpanRefForOperatorReentry({
    basis: input.basis,
    sourceVectorIndex: targetVectorIndex,
    terminalVectorIndex,
    scope: "repair"
  });
  const evidenceRefs = uniqueSorted([
    dossier.currentGapDossierRef,
    ...dossier.evidenceRefs,
    ...targetedPlans.flatMap((entry) => [
      entry.plan.sourceGapDossierRef,
      ...entry.plan.diagnosticEvidenceRefs,
      ...entry.plan.repairRowEvidenceRefs
    ])
  ]);
  const assessment = admitGraphSpanAssessment({
    basis: input.basis,
    span,
    assessmentId: `graph-span-assessment:odd-sdlc-repair:${JSON.stringify({
      basisId: input.basis.id,
      targetVectorIndex,
      terminalVectorIndex,
      failures: targetedPlans.map((entry) => entry.plan.failureId).sort(),
      generation
    })}`,
    attemptIndex: 0,
    assessmentRegime: "F_P",
    obligationRows: targetedPlans.map((entry) =>
      Object.freeze({
        obligationId: `component-repair-reentry:${entry.plan.failureId}`,
        sourceAuthorityRef: entry.plan.sourceGapDossierRef,
        status: "semantic_gap" as const,
        terminalEvidenceRefs: Object.freeze([]),
        carryObservations: Object.freeze([
          Object.freeze({
            fromVectorIndex: entry.targetVectorIndex,
            toVectorIndex: terminalVectorIndex,
            status: "dropped" as const,
            evidenceRefs
          })
        ]),
        detail: `component repair row ${entry.plan.failureId} targets ${entry.plan.targetEdgeName}`
      })
    ),
    constitutionalReentry: null,
    evidenceRefs,
    edgeFoldbackRefs: Object.freeze([]),
    detail: "odd_sdlc component repair schedule requires graph-span repair reentry",
    generation
  });
  return applyGraphSpanReentryRoute({
    basis: input.basis,
    runtimeEvents: Object.freeze([
      ...input.replayEvents,
      ...input.emittedEvents
    ]),
    eventSink: collectAbgAuthoredRuntimeEvent,
    terminalVectorIndex,
    assessments: Object.freeze([assessment]),
    causationEventRefs: evidenceRefs,
    generation
  }).emittedEvents;
}

function postActionReentryGraphSpanRuntimeEvents(input: {
  readonly basis: ExecutionBasis;
  readonly consequence: SdlcInstalledOperatorTraversalConsequence;
  readonly currentVectorIndex: number;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly emittedEvents: readonly RuntimeEvent[];
}): readonly RuntimeEvent[] {
  const closure = input.consequence.edgeClosureDecision;
  const nextAction = input.consequence.nextActionProjection;
  if (
    !["retry", "repair", "re-enter"].includes(closure.disposition) ||
    !nextAction.choosesNextTraversal ||
    nextAction.nextGraphVectorRef === null
  ) {
    return Object.freeze([]);
  }
  const targetVectorIndex = vectorIndexByEdgeName({
    basis: input.basis,
    edgeName: nextAction.nextGraphVectorRef
  });
  if (targetVectorIndex === null || targetVectorIndex > input.currentVectorIndex) {
    return Object.freeze([]);
  }
  const generation =
    [...input.replayEvents, ...input.emittedEvents].filter(
      (event) => event.kind === "graph_span_foldback_evaluated"
    ).length + 1;
  const span = graphSpanRefForOperatorReentry({
    basis: input.basis,
    sourceVectorIndex: targetVectorIndex,
    terminalVectorIndex: input.currentVectorIndex,
    scope: "post-action"
  });
  const evidenceRefs = uniqueSorted([
    closure.decisionRef,
    nextAction.nextActionProjectionRef,
    ...closure.reasonRefs,
    ...nextAction.gapPressureRefs
  ]);
  const obligationRef =
    evidenceRefs[0] ?? `post-action-reentry:${closure.disposition}`;
  const assessment = admitGraphSpanAssessment({
    basis: input.basis,
    span,
    assessmentId: `graph-span-assessment:odd-sdlc-post-action:${JSON.stringify({
      basisId: input.basis.id,
      targetVectorIndex,
      terminalVectorIndex: input.currentVectorIndex,
      disposition: closure.disposition,
      generation
    })}`,
    attemptIndex: 0,
    assessmentRegime: "F_P",
    obligationRows: Object.freeze([
      Object.freeze({
        obligationId: `post-action-reentry:${closure.disposition}:${obligationRef}`,
        sourceAuthorityRef: closure.decisionRef,
        status: "semantic_gap" as const,
        terminalEvidenceRefs: Object.freeze([]),
        carryObservations: Object.freeze([
          Object.freeze({
            fromVectorIndex: targetVectorIndex,
            toVectorIndex: input.currentVectorIndex,
            status: "dropped" as const,
            evidenceRefs
          })
        ]),
        detail:
          `${closure.disposition} closure selected ${nextAction.nextGraphVectorRef}`
      })
    ]),
    constitutionalReentry: null,
    evidenceRefs,
    edgeFoldbackRefs: Object.freeze([]),
    detail: "odd_sdlc post-action closure requires graph reentry",
    generation
  });
  return applyGraphSpanReentryRoute({
    basis: input.basis,
    runtimeEvents: Object.freeze([
      ...input.replayEvents,
      ...input.emittedEvents
    ]),
    eventSink: collectAbgAuthoredRuntimeEvent,
    terminalVectorIndex: input.currentVectorIndex,
    assessments: Object.freeze([assessment]),
    causationEventRefs: evidenceRefs,
    generation
  }).emittedEvents;
}

function dispatchResultRef(manifest: SdlcWorkerHandoffManifest): string {
  return pathToFileURL(manifest.reportFile).href;
}

function runtimeFailureArtifact(input: {
  readonly failureClass: RuntimeFailureClass;
  readonly detail: string;
}): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: "runtime_failure",
    failureClass: input.failureClass,
    detail: input.detail
  });
}

function noDispatchReport(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): SdlcWorkerResultReport {
  return Object.freeze({
    ...input.report,
    summary:
      "system projection report from declared edge-output policy",
    fpTransformRequestRef: null,
    fpTransformResultRef: null,
    fpTransformStatusSnapshot: null
  });
}

function declaredEdgeProjectionPendingAssessment(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly obligation: SdlcTraversalObligation;
}): SdlcWorkerObligationAssessment {
  const outputRef = pathToFileURL(input.manifest.outputFile).href;
  return Object.freeze({
    kind: "sdlc_worker_obligation_assessment" as const,
    obligationId: input.obligation.obligationId,
    fulfillmentStatus: "fulfilled" as const,
    evidenceRefs: uniqueSorted([outputRef, ...input.obligation.evidenceRefs]),
    blockingReasons: Object.freeze([])
  });
}

function buildDeclaredEdgeProjectionPendingReport(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
}): SdlcWorkerResultReport {
  const digestBasis = Object.freeze({
    kind: "sdlc_declared_edge_projection_pending_report",
    graphFunctionName: input.manifest.graphFunctionName,
    edgeName: input.manifest.edgeName,
    targetAssetType: input.manifest.targetAssetType,
    outputFile: resolve(input.manifest.outputFile)
  });
  return Object.freeze({
    kind: "odd_sdlc.worker_result_report" as const,
    projectionRole: "typed_fp_stage_projection" as const,
    authoritativeStageResultRef: pathToFileURL(
      input.manifest.fpEvaluateResultFile
    ).href,
    graphFunctionName: input.manifest.graphFunctionName,
    edgeName: input.manifest.edgeName,
    targetAssetType: input.manifest.targetAssetType,
    outputFile: resolve(input.manifest.outputFile),
    digest: sha256Text(stableOperatorJson(digestBasis)),
    summary:
      "system projection report for consequence-stage declared edge-output projection",
    unresolvedReasons: Object.freeze([]),
    materializedFiles: Object.freeze([]),
    materializationDiagnostics: Object.freeze([]),
    executionEvidence: null,
    executionEvidenceErrors: Object.freeze([]),
    obligationAssessments: Object.freeze(
      input.manifest.traversalObligationContext.obligations.map((obligation) =>
        declaredEdgeProjectionPendingAssessment({
          manifest: input.manifest,
          obligation
        })
      )
    ),
    subworkstreamManifest: defaultComputeSubworkstreamManifest({
      manifest: input.manifest,
      stageRef: "transform.C",
      source: "system_default",
      parentResultRef: pathToFileURL(input.manifest.reportFile).href
    }),
    fpTransformRequestRef: null,
    fpTransformResultRef: null,
    fpTransformStatusSnapshot: null,
    fpEvaluateResultRef: pathToFileURL(input.manifest.fpEvaluateResultFile).href
  });
}

function writeDeclaredEdgeProjectionFromConsequence(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
}): readonly string[] {
  const outputFile = writeDeclaredEdgeProjectionOutput({
    manifest: input.manifest
  });
  if (outputFile === null) {
    return Object.freeze([]);
  }
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    artifactRef: "operator-run-artifact://declared-edge-projection-artifact",
    payload: {
      kind: "sdlc_declared_edge_projection_artifact",
      writerInterface: "plugin.consequence.C.writeDeclaredEdgeProjectionOutput",
      targetAssetType: input.manifest.targetAssetType,
      outputFile,
      outputRef: pathToFileURL(outputFile).href,
      sourceFunction: "consequence.edge_projection.writeDeclaredEdgeProjectionOutput"
    }
  });
  return uniqueSorted([
    pathToFileURL(outputFile).href,
    pathToFileURL(
      join(input.manifest.archiveRoot, "declared_edge_projection_artifact.json")
    ).href
  ]);
}

function stateWithConsequenceProjectedExecutionEvidence(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
}): SdlcAbgOwnedFpDispatchState {
  const report = input.state.workerReport;
  if (
    report === null ||
    report.executionEvidence !== null ||
    input.state.manifest.targetAssetType !== "test_execution_result_surface"
  ) {
    return input.state;
  }
  const executionEvidence = admittedTestExecutionResultOutput(input.state.manifest);
  if (executionEvidence === null) {
    return input.state;
  }
  return Object.freeze({
    ...input.state,
    workerReport: Object.freeze({
      ...report,
      executionEvidence,
      executionEvidenceErrors: Object.freeze([])
    })
  });
}

function reportWithDeclaredNoDispatchProjection(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): SdlcWorkerResultReport {
  if (input.manifest.targetAssetType !== "test_execution_result_surface") {
    return input.report;
  }
  writeDeclaredEdgeProjectionFromConsequence({
    manifest: input.manifest
  });
  const executionEvidence = admittedTestExecutionResultOutput(input.manifest);
  if (executionEvidence === null) {
    return input.report;
  }
  return Object.freeze({
    ...input.report,
    executionEvidence,
    executionEvidenceErrors: Object.freeze([])
  });
}

function manifestCapabilityValue(
  manifest: SdlcWorkerHandoffManifest,
  name: string
): string | null {
  return (
    manifest.conformedProject.capabilityContracts.find(
      (contract) => contract.name === name
    )?.value ?? null
  );
}

function truthyCapabilityValue(value: string | null): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function traversalOutcomeClassForManifest(
  manifest: SdlcWorkerHandoffManifest
): SdlcTraversalOutcomeClass {
  return resolveSdlcTraversalOutcomeClass({
    explicitValue: manifestCapabilityValue(manifest, "sdlc_outcome_class"),
    trivialProduct: truthyCapabilityValue(
      manifestCapabilityValue(manifest, "trivial_product")
    )
  }).outcomeClass;
}

function canonicalSummaryForManifest(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly carriers: ReturnType<typeof deriveSdlcStagedConstructionAuditCarriers>;
}): SdlcDecompositionSummary | null {
  const summaries = input.carriers
    .filter(
      (carrier): carrier is {
        readonly artifactRef: string;
        readonly relativePath: string;
        readonly payload: SdlcDecompositionSummary;
      } => carrier.payload.kind === "sdlc_decomposition_summary"
    );
  const preferTest =
    input.manifest.targetAssetType.includes("test") ||
    input.manifest.targetCarrierProjection.requiredStagedAuthorityRefs.some((ref) =>
      ref.includes("test")
    );
  const preferred = summaries.find((carrier) =>
    preferTest
      ? carrier.artifactRef === "operator-run-artifact://test-decomposition-summary"
      : carrier.artifactRef ===
        "operator-run-artifact://implementation-decomposition-summary"
  );
  return preferred?.payload ?? summaries[0]?.payload ?? null;
}

type LiveParallelLaneKind = "dev" | "test";

interface LiveParallelMaterializationLane {
  readonly laneKind: "dev";
  readonly branchKey: string;
  readonly node: SdlcDependencyMapNode;
  readonly targetRef: string;
  readonly normalizedTargetRef: string;
}

function sdlcLiveSlug(input: string): string {
  return (
    input
      .trim()
      .replace(/[^A-Za-z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "")
      .toLowerCase() || "unnamed"
  );
}

function normalizedLiveMaterializationTarget(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly targetRef: string;
}): string {
  return normalizeSdlcLiveFpParallelMaterializationTarget({
    targetRef: input.targetRef,
    selectedOutputRoot: input.manifest.productMaterialization.selectedOutputRoot,
    tenantRoot: input.manifest.productMaterialization.tenantRoot
  });
}

function liveParallelModuleLaneKind(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly normalizedTargetRef: string;
}): "dev" | null {
  const role = tenantStackDeclaredMaterializedRoleForRelativePath({
    manifest: input.manifest,
    relativePath: input.normalizedTargetRef
  });
  return role === "source" ? "dev" : null;
}

function liveParallelLaneForNode(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly node: SdlcDependencyMapNode;
}): LiveParallelMaterializationLane | null {
  for (const targetRef of input.node.materializationTargetRefs) {
    const normalizedTargetRef = normalizedLiveMaterializationTarget({
      manifest: input.manifest,
      targetRef
    });
    const laneKind = liveParallelModuleLaneKind({
      manifest: input.manifest,
      normalizedTargetRef
    });
    if (laneKind === null) {
      continue;
    }
    return Object.freeze({
      laneKind,
      branchKey: `${laneKind}-${sdlcLiveSlug(
        sdlcLiveParallelMaterializationTargetKey(normalizedTargetRef)
      )}`,
      node: input.node,
      targetRef,
      normalizedTargetRef
    });
  }
  return null;
}

function liveParallelWorkerProcessRef(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly branchKey: string;
}): string {
  return `abg-native-branch-task://odd-sdlc/live/${manifestRefSegment(input.manifest)}/${input.branchKey}`;
}

function liveParallelFrontierRef(manifest: SdlcWorkerHandoffManifest): string {
  return `frontier://odd-sdlc/live/${manifestRefSegment(manifest)}/parallel-materialization`;
}

function liveParallelFanInScopeRef(manifest: SdlcWorkerHandoffManifest): string {
  return `fan-in://odd-sdlc/live/${manifestRefSegment(manifest)}/parallel-materialization`;
}

function moduleDependencyMapFromAuditCarriers(
  carriers: readonly SdlcStagedConstructionAuditCarrier[]
): SdlcModuleDependencyMap | null {
  const carrier = carriers.find(
    (candidate) => candidate.artifactRef === "operator-run-artifact://module-dependency-map"
  );
  return carrier?.payload.kind === "sdlc_module_dependency_map"
    ? carrier.payload
    : null;
}

function moduleTraversalSelectionFromAuditCarriers(
  carriers: readonly SdlcStagedConstructionAuditCarrier[]
): SdlcDependencyTraversalSelection | null {
  const carrier = carriers.find(
    (candidate) =>
      candidate.artifactRef ===
      "operator-run-artifact://module-dependency-traversal-selection"
  );
  return carrier?.payload.kind === "sdlc_dependency_traversal_selection"
    ? carrier.payload
    : null;
}

function testDependencyMapFromAuditCarriers(
  carriers: readonly SdlcStagedConstructionAuditCarrier[]
): SdlcTestDependencyMap | null {
  const carrier = carriers.find(
    (candidate) => candidate.artifactRef === "operator-run-artifact://test-dependency-map"
  );
  return carrier?.payload.kind === "sdlc_test_dependency_map"
    ? carrier.payload
    : null;
}

function uatTestDependencyMapFromAuditCarriers(
  carriers: readonly SdlcStagedConstructionAuditCarrier[]
): SdlcTestDependencyMap | null {
  const carrier = carriers.find(
    (candidate) =>
      candidate.artifactRef === "operator-run-artifact://uat-test-dependency-map"
  );
  return carrier?.payload.kind === "sdlc_test_dependency_map"
    ? carrier.payload
    : null;
}

function testTraversalSelectionFromAuditCarriers(
  carriers: readonly SdlcStagedConstructionAuditCarrier[]
): SdlcDependencyTraversalSelection | null {
  const carrier = carriers.find(
    (candidate) =>
      candidate.artifactRef ===
      "operator-run-artifact://test-dependency-traversal-selection"
  );
  return carrier?.payload.kind === "sdlc_dependency_traversal_selection"
    ? carrier.payload
    : null;
}

function uatTestTraversalSelectionFromAuditCarriers(
  carriers: readonly SdlcStagedConstructionAuditCarrier[]
): SdlcDependencyTraversalSelection | null {
  const carrier = carriers.find(
    (candidate) =>
      candidate.artifactRef ===
      "operator-run-artifact://uat-test-dependency-traversal-selection"
  );
  return carrier?.payload.kind === "sdlc_dependency_traversal_selection"
    ? carrier.payload
    : null;
}

function liveParallelNodeTargetRefs(
  node: SdlcFeatureDependencyDag["nodes"][number]
): readonly string[] {
  return uniqueSorted(
    node.targetAssetRefs.length > 0
      ? node.targetAssetRefs
      : node.outputAllocationRefs.map((ref) => ref.replace(/^artifact:\/\//u, ""))
  );
}

function liveParallelFrontierDependencyMap(input: {
  readonly source: SdlcModuleDependencyMap;
  readonly lanes: readonly LiveParallelMaterializationLane[];
}): SdlcModuleDependencyMap {
  const laneIds = new Set(input.lanes.map((lane) => lane.node.nodeId));
  const sourceIds = new Set(input.source.nodes.map((node) => node.nodeId));
  const preserveLaneOrMalformedRef = (nodeId: string): boolean =>
    laneIds.has(nodeId) || !sourceIds.has(nodeId);
  return Object.freeze({
    ...input.source,
    nodes: Object.freeze(
      input.lanes.map((lane) =>
        Object.freeze({
          ...lane.node,
          predecessorNodeIds: Object.freeze(
            lane.node.predecessorNodeIds.filter(preserveLaneOrMalformedRef)
          ),
          successorNodeIds: Object.freeze(
            lane.node.successorNodeIds.filter(preserveLaneOrMalformedRef)
          )
        })
      )
    )
  });
}

function liveParallelFanInTargetRefs(input: {
  readonly source: SdlcModuleDependencyMap;
  readonly lanes: readonly LiveParallelMaterializationLane[];
}): readonly string[] {
  const laneNodeIds = new Set(input.lanes.map((lane) => lane.node.nodeId));
  const successorNodeIds = new Set(
    input.lanes.flatMap((lane) => lane.node.successorNodeIds)
  );
  return uniqueSorted(
    input.source.nodes
      .filter(
        (node) =>
          successorNodeIds.has(node.nodeId) && !laneNodeIds.has(node.nodeId)
      )
      .flatMap((node) => node.materializationTargetRefs)
  );
}

function liveParallelBranchRowsFromCompilation(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly dag: SdlcFeatureDependencyDag;
  readonly compilation: SdlcAbgFrontierCompilation;
}): readonly SdlcLiveFpParallelMaterializationBranchRow[] {
  return input.dag.nodes.flatMap((node, index) => {
    if (node.nodeKind === "fan_in") {
      return [];
    }
    const branchRef = input.compilation.branchRefs[index];
    if (branchRef === undefined) {
      return [];
    }
    const targetRefs = liveParallelNodeTargetRefs(node);
    const laneKind: LiveParallelLaneKind =
      node.nodeKind === "test_materialization" ||
      node.nodeKind === "uat_test_materialization"
        ? "test"
        : "dev";
    return Object.freeze({
      branchRef: branchRef.branchRef,
      branchKey: branchRef.branchKey,
      nodeId: node.nodeRef,
      laneKind,
      workerProcessRef: liveParallelWorkerProcessRef({
        manifest: input.manifest,
        branchKey: branchRef.branchKey
      }),
      materializationTargetRefs: targetRefs,
      readRefs: node.readRefs,
      writeTerritoryRefs: node.writeTerritoryRefs,
      outputAllocationRefs: node.outputAllocationRefs
    });
  });
}

function liveParallelFanInRowsFromCompilation(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly dag: SdlcFeatureDependencyDag;
  readonly compilation: SdlcAbgFrontierCompilation;
}): readonly SdlcLiveFpParallelMaterializationFanInRow[] {
  const branchByNodeRef = new Map(
    input.dag.nodes.flatMap((node, index) => {
      const branchRef = input.compilation.branchRefs[index];
      return branchRef === undefined
        ? []
        : [[node.nodeRef, branchRef] as const];
    })
  );
  return input.dag.nodes.flatMap((node) => {
    if (node.nodeKind !== "fan_in") {
      return [];
    }
    const branchRef = branchByNodeRef.get(node.nodeRef);
    if (branchRef === undefined) {
      return [];
    }
    const declaration = input.compilation.declarations.find(
      (candidate) => candidate.branchRef.branchRef === branchRef.branchRef
    );
    return [
      Object.freeze({
        branchRef: branchRef.branchRef,
        nodeId: node.nodeRef,
        predecessorBranchRefs: declaration?.parentBranchRefs ?? Object.freeze([]),
        materializationTargetRefs: liveParallelNodeTargetRefs(node),
        payloadDigest: `payload://odd-sdlc/live/${sdlcLiveSlug(input.manifest.edgeName)}/fan-in`
      })
    ];
  });
}

function liveParallelTask(input: {
  readonly declaration: SdlcAbgFrontierCompilation["declarations"][number];
  readonly payloadDigest: string;
  readonly counters: { active: number; maxActive: number };
}): NativeBranchTask {
  return Object.freeze({
    kind: "native_branch_task" as const,
    branchRef: input.declaration.branchRef.branchRef,
    run: async () => {
      input.counters.active += 1;
      input.counters.maxActive = Math.max(input.counters.maxActive, input.counters.active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      input.counters.active -= 1;
      return Object.freeze({
        kind: "native_branch_task_result" as const,
        branchRef: input.declaration.branchRef.branchRef,
        payloadDigest: input.payloadDigest,
        evidenceRefs: Object.freeze([input.declaration.branchRef.branchRef])
      });
    }
  });
}

async function writeLiveFpParallelMaterializationFrontier(input: {
  readonly basis: ExecutionBasis;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly carriers: readonly SdlcStagedConstructionAuditCarrier[];
  readonly eventSink: (event: RuntimeEvent) => void;
}): Promise<void> {
  if (input.manifest.edgeName !== "derive_component_code_surface") {
    return;
  }
  if (
    existsSync(
      join(input.manifest.archiveRoot, "sdlc_live_fp_parallel_materialization_frontier.json")
    )
  ) {
    return;
  }
  const dependencyMap = moduleDependencyMapFromAuditCarriers(input.carriers);
  const traversal = moduleTraversalSelectionFromAuditCarriers(input.carriers);
  const testDependencyMap = testDependencyMapFromAuditCarriers(input.carriers);
  const testTraversal = testTraversalSelectionFromAuditCarriers(input.carriers);
  const uatTestDependencyMap = uatTestDependencyMapFromAuditCarriers(input.carriers);
  const uatTestTraversal =
    uatTestTraversalSelectionFromAuditCarriers(input.carriers);
  if (
    dependencyMap === null ||
    traversal === null ||
    traversal.selectedMethod !== "parallel"
  ) {
    return;
  }
  const selectedTestDependencyMap =
    testDependencyMap !== null && testTraversal?.selectedMethod === "parallel"
      ? testDependencyMap
      : undefined;
  const selectedUatTestDependencyMap =
    uatTestDependencyMap !== null &&
    uatTestTraversal?.selectedMethod === "parallel"
      ? uatTestDependencyMap
      : undefined;
  const lanes = dependencyMap.nodes
    .map((node) => liveParallelLaneForNode({ manifest: input.manifest, node }))
    .filter((lane) => lane !== null);
  const devLaneCount = lanes.length;
  const componentTestLaneCount = selectedTestDependencyMap?.nodes.length ?? 0;
  const uatTestLaneCount = selectedUatTestDependencyMap?.nodes.length ?? 0;
  const testLaneCount = componentTestLaneCount + uatTestLaneCount;
  const laneCount = devLaneCount + testLaneCount;
  if (laneCount < 2) {
    return;
  }
  const frontierDependencyMap = liveParallelFrontierDependencyMap({
    source: dependencyMap,
    lanes
  });
  const fanInTargetRefs = liveParallelFanInTargetRefs({
    source: dependencyMap,
    lanes
  });
  const dag = deriveSdlcFeatureDependencyDagFromMaps({
    dagRef: `dag://odd-sdlc/live/${manifestRefSegment(input.manifest)}/parallel-materialization`,
    graphFunctionName: input.manifest.graphFunctionName,
    moduleDependencyMap: frontierDependencyMap,
    testDependencyMap: selectedTestDependencyMap,
    uatTestDependencyMap: selectedUatTestDependencyMap,
    traversalSelectionRef: traversal.selectionRef,
    ...(fanInTargetRefs.length === 0 ? {} : { fanInTargetRefs }),
    evidenceRefs: Object.freeze([
      dependencyMap.mapRef,
      traversal.selectionRef,
      ...(selectedTestDependencyMap === undefined
        ? []
        : [
            selectedTestDependencyMap.mapRef,
            ...(testTraversal === null ? [] : [testTraversal.selectionRef])
          ]),
      ...(selectedUatTestDependencyMap === undefined
        ? []
        : [
            selectedUatTestDependencyMap.mapRef,
            ...(uatTestTraversal === null ? [] : [uatTestTraversal.selectionRef])
          ])
    ])
  });
  if (dag.blockingReasons.length > 0 || dag.startNodes.length < 2) {
    return;
  }
  const branchOverrides = deriveSdlcLiveFpParallelMaterializationBranchOverrides({
    edgeName: input.manifest.edgeName,
    selectedOutputRoot: input.manifest.productMaterialization.selectedOutputRoot,
    tenantRoot: input.manifest.productMaterialization.tenantRoot,
    dag
  });
  const compilation = compileSdlcFeatureDependencyDagToAbgFrontier({
    dag,
    frontierRef: liveParallelFrontierRef(input.manifest),
    graphCallId: `graph-call://odd-sdlc/live/${manifestRefSegment(input.manifest)}/parallel-materialization`,
    frameId:
      input.basis.frameId ??
      `frame://odd-sdlc/live/${manifestRefSegment(input.manifest)}/parallel-materialization`,
    fanInScopeRef: liveParallelFanInScopeRef(input.manifest),
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    frameLineageId: input.basis.frameLineageId,
    frameAttemptId: null,
    commandKind: `materialize_live_parallel_sdlc_branch:${input.manifest.edgeName}`,
    workKeyPrefix: `work://odd-sdlc/live/${manifestRefSegment(input.manifest)}`,
    basisRefs: Object.freeze([
      dependencyMap.mapRef,
      traversal.selectionRef,
      ...(selectedTestDependencyMap === undefined
        ? []
        : [
            selectedTestDependencyMap.mapRef,
            ...(testTraversal === null ? [] : [testTraversal.selectionRef])
          ]),
      ...(selectedUatTestDependencyMap === undefined
        ? []
        : [
            selectedUatTestDependencyMap.mapRef,
            ...(uatTestTraversal === null ? [] : [uatTestTraversal.selectionRef])
          ])
    ]),
    branchKeyByNodeRef: branchOverrides.branchKeyByNodeRef,
    branchRefByNodeRef: branchOverrides.branchRefByNodeRef
  });
  if (
    compilation.writeTerritoryConflictRefs.length > 0 ||
    compilation.outputAllocationConflictRefs.length > 0
  ) {
    return;
  }
  const branchRows = liveParallelBranchRowsFromCompilation({
    manifest: input.manifest,
    dag,
    compilation
  });
  const fanInRows = liveParallelFanInRowsFromCompilation({
    manifest: input.manifest,
    dag,
    compilation
  });
  const declarations = compilation.declarations;
  const counters = { active: 0, maxActive: 0 };
  const emittedEvents: RuntimeEvent[] = [];
  const parallelBatchSize = resolveSdlcLiveFpParallelBatchSize({ laneCount });
  const run = await runEventedNativeSagaFrontier({
    basis: input.basis,
    frontierRef: liveParallelFrontierRef(input.manifest),
    declarations,
    policy: constructBranchExecutionPolicy({
      policyRef: `policy://odd-sdlc/live/${manifestRefSegment(input.manifest)}/parallel-materialization/max-${parallelBatchSize}`,
      maxConcurrency: parallelBatchSize,
      maxRetryAttempts: 0,
      leaseTtlMs: 10_000,
      resolvedSystemPolicyRefs: Object.freeze([
        "abg://event-sourced-saga-frontier",
        traversal.selectionRef
      ])
    }),
    tasks: declarations.map((declaration) => {
      const fanInPayloadDigest =
        fanInRows.find((row) => row.branchRef === declaration.branchRef.branchRef)
          ?.payloadDigest;
      return liveParallelTask({
        declaration,
        payloadDigest:
          typeof fanInPayloadDigest === "string"
            ? fanInPayloadDigest
            : `payload://odd-sdlc/live/${sdlcLiveSlug(input.manifest.edgeName)}/${declaration.branchRef.branchKey}`,
        counters
      });
    }),
    eventSink: (event) => {
      emittedEvents.push(event);
      input.eventSink(event);
    },
    maxBatches: Math.max(3, Math.ceil(declarations.length / parallelBatchSize) + 1),
    correlationId: `correlation://odd-sdlc/live/${manifestRefSegment(input.manifest)}/parallel-materialization`
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    artifactRef: "operator-run-artifact://live-fp-parallel-materialization-frontier",
    payload: constructSdlcLiveFpParallelMaterializationFrontier({
      edgeName: input.manifest.edgeName,
      executionAuthority: "abg_evented_saga_frontier",
      parallelismControl: "abg_branch_execution_policy",
      graphTruthSource: "sdlc_feature_dependency_dag",
      selectedMethod: traversal.selectedMethod,
      dependencyMapRef: dependencyMap.mapRef,
      testDependencyMapRef: selectedTestDependencyMap?.mapRef ?? null,
      uatTestDependencyMapRef: selectedUatTestDependencyMap?.mapRef ?? null,
      dependencyMapRefs: Object.freeze([
        dependencyMap.mapRef,
        ...(selectedTestDependencyMap === undefined
          ? []
          : [selectedTestDependencyMap.mapRef]),
        ...(selectedUatTestDependencyMap === undefined
          ? []
          : [selectedUatTestDependencyMap.mapRef])
      ]),
      traversalSelectionRef: traversal.selectionRef,
      testTraversalSelectionRef:
        selectedTestDependencyMap === undefined
          ? null
          : testTraversal?.selectionRef ?? null,
      uatTestTraversalSelectionRef:
        selectedUatTestDependencyMap === undefined
          ? null
          : uatTestTraversal?.selectionRef ?? null,
      traversalSelectionRefs: Object.freeze([
        traversal.selectionRef,
        ...(testTraversal?.selectedMethod === "parallel"
          ? [testTraversal.selectionRef]
          : []),
        ...(uatTestTraversal?.selectedMethod === "parallel"
          ? [uatTestTraversal.selectionRef]
          : [])
      ]),
      dagRef: dag.dagRef,
      startNodes: dag.startNodes,
      frontierRef: run.frontierRef,
      policyRef: run.policyRef,
      laneCount,
      devLaneCount,
      componentTestLaneCount,
      uatTestLaneCount,
      testLaneCount,
      fanInCount: fanInRows.length,
      batchCount: run.batchCount,
      batchSizes: run.batches.map(
        (batch) => batch.selection.selectedBranchRefs.length
      ),
      maxActive: counters.maxActive,
      readyBranchRefs: run.batches[0]?.selection.selectedBranchRefs ?? Object.freeze([]),
      compiledReadyBranchRefs: compilation.readyBranchRefs,
      completedBranchRefs: run.completedBranchRefs,
      failedBranchRefs: run.failedBranchRefs,
      writeTerritoryConflictRefs: compilation.writeTerritoryConflictRefs,
      outputAllocationConflictRefs: compilation.outputAllocationConflictRefs,
      branchRows,
      fanInRows,
      emittedEventKinds: uniqueSorted(run.emittedEvents.map((event) => event.kind)),
      emittedEventCount: emittedEvents.length,
      replayEventCount: run.replayEvents.length
    })
  });
}

async function writeTraversalSelectionAudit(input: {
  readonly basis: ExecutionBasis;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly postflight: SdlcPostflightResult;
  readonly edgeAccountingRow: SdlcExecutiveEdgeAccountingRow | null;
  readonly eventSink: (event: RuntimeEvent) => void;
  readonly fpEvaluatorAdmissionEvidenceRefs?: readonly string[] | undefined;
}): Promise<void> {
  const auditCarriers = deriveSdlcStagedConstructionAuditCarriers(
    input.manifest,
    input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([])
  );
  const writtenRefs: string[] = [];
  for (const carrier of auditCarriers) {
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      artifactRef: carrier.artifactRef,
      payload: carrier.payload
    });
    writtenRefs.push(
      pathToFileURL(join(input.manifest.archiveRoot, carrier.relativePath)).href
    );
  }
  await writeLiveFpParallelMaterializationFrontier({
    basis: input.basis,
    manifest: input.manifest,
    carriers: auditCarriers,
    eventSink: input.eventSink
  });
  const canonicalSummary = canonicalSummaryForManifest({
    manifest: input.manifest,
    carriers: auditCarriers
  });
  if (canonicalSummary !== null) {
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      artifactRef: "operator-run-artifact://decomposition-summary",
      payload: canonicalSummary
    });
    writtenRefs.push(
      pathToFileURL(join(input.manifest.archiveRoot, "sdlc_decomposition_summary.json")).href
    );
  }

  const projectionOnlyEligible =
    input.edgeAccountingRow?.disposition === "projection_no_close";
  const evidenceRefs = uniqueSorted([
    ...input.postflight.evidenceRefs,
    ...writtenRefs,
    ...(projectionOnlyEligible ? [pathToFileURL(input.manifest.outputFile).href] : [])
  ]);
  if (
    canonicalSummary === null &&
    !projectionOnlyEligible &&
    input.manifest.targetCarrierProjection.constructionDepthRole === "none"
  ) {
    return;
  }
  const frontDoorSelection =
    canonicalSummary === null
      ? readArchivedFrontDoorTraversalSelection(input.manifest)
      : null;
  const selection = frontDoorSelection ?? deriveSdlcTraversalHopSelection({
    selectionRef: `selection://odd-sdlc/${manifestRefSegment(input.manifest)}/traversal-hop`,
    outcomeClass: traversalOutcomeClassForManifest(input.manifest),
    decompositionSummary: canonicalSummary,
    projectionOnlyEligible,
    bundleEligible:
      traversalOutcomeClassForManifest(input.manifest) !== "domain_product" &&
      canonicalSummary !== null,
    evidenceRefs
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "sdlc_traversal_hop_selection.json",
    payload: selection
  });
}

function writeFrontDoorTraversalSelectionAudit(input: {
  readonly basis: ExecutionBasis;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly summary: SdlcDecompositionSummary | null;
  readonly selection: SdlcTraversalHopSelection | null;
}): void {
  if (
    input.manifest.vectorIndex !== 0 ||
    input.summary === null ||
    input.selection === null
  ) {
    return;
  }
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "sdlc_frontdoor_decomposition_summary.json",
    payload: input.summary
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "sdlc_frontdoor_traversal_hop_selection.json",
    payload: input.selection
  });
}

function workerFailureRuntimeFailureClass(
  postflight: SdlcPostflightResult
): RuntimeFailureClass {
  const carrier = postflight.blockingReasonCarriers[0];
  if (
    carrier !== undefined &&
    (carrier.code === "silent_worker_inactivity" ||
      carrier.code === "worker_hard_timeout") &&
    (carrier.detail?.includes("stdoutBytes=0;stderrBytes=0") ?? false)
  ) {
    return "no_output";
  }
  if (
    carrier !== undefined &&
    (carrier.code === "worker_executor_unavailable" ||
      carrier.code === "worker_connection_failed" ||
      carrier.code === "worker_launch_failed" ||
      carrier.code === "worker_lost_terminal")
  ) {
    return "transport_failure";
  }
  return "runtime_failure";
}

function actorInvocationForPluginInput(input: {
  readonly pluginInput: EnginePluginInput;
  readonly transport: SdlcWorkerTransportContract;
}): ActorInvocation {
  const ref = input.pluginInput.actorInvocationRef;
  if (ref === null) {
    throw new TypeError("ABG process actor invocation requires actor ref");
  }
  if (input.pluginInput.graphCallId === null || input.pluginInput.frameId === null) {
    throw new TypeError("ABG process actor invocation requires graph/frame refs");
  }
  return Object.freeze({
    kind: "actor_invocation",
    actorInvocationId: ref.actorInvocationId,
    basisId: input.pluginInput.basisId,
    graphFunctionId: input.pluginInput.graphFunctionId,
    runId: null,
    workKey: null,
    graphCallId: input.pluginInput.graphCallId,
    frameId: input.pluginInput.frameId,
    vectorIndex: input.pluginInput.vectorIndex,
    edge: input.pluginInput.edge,
    attemptIndex: ref.attemptIndex,
    dispatchRef: ref.dispatchRef,
    workerId: input.transport.workerId,
    backendId: input.transport.backendId,
    resultRef: ref.resultRef,
    causationEventRefs: Object.freeze([ref.dispatchRef]),
    correlationId: [
      "odd-sdlc-installed-operator",
      input.pluginInput.basisId,
      String(input.pluginInput.vectorIndex),
      String(ref.attemptIndex)
    ].join(":")
  });
}

function environmentPolicyForTransport(
  transport: SdlcWorkerTransportContract
): { readonly prefixes: readonly string[] } {
  if (transport.agentKey === "claude") {
    return Object.freeze({
      prefixes: Object.freeze([
        "CLAUDE_CODE_SSE_",
        "CLAUDE_CODE_ENTRYPOINT",
        "CLAUDE_CODE_EXECPATH"
      ])
    });
  }
  return Object.freeze({ prefixes: Object.freeze([]) });
}

function installedOperatorChildProcessEnvironment(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value !== "string") {
      continue;
    }
    if (key === "NODE_TEST_CONTEXT") {
      continue;
    }
    env[key] = value;
  }
  return env;
}

function workerInactivityPolicy(): {
  readonly timeoutMs: number;
  readonly inactivityTimeoutMs: number;
  readonly heartbeatMs: number;
  readonly terminationGraceMs: number;
} {
  const policy = sdlcOperatorRuntimePolicy();
  return Object.freeze({
    timeoutMs: policy.workerTimeoutMs,
    inactivityTimeoutMs: policy.workerInactivityTimeoutMs,
    heartbeatMs: policy.workerHeartbeatMs,
    terminationGraceMs: policy.workerTerminationGraceMs
  });
}

function designDepthFpEvaluatorTimeoutMs(): number {
  return sdlcOperatorRuntimePolicy().designDepthFpEvaluatorTimeoutMs;
}

function designDepthFpEvaluatorFirstUpdateTimeoutMs(): number {
  const policy = sdlcOperatorRuntimePolicy();
  return Math.min(
    policy.designDepthFpEvaluatorTimeoutMs,
    policy.designDepthFpEvaluatorFirstUpdateTimeoutMs
  );
}

function designDepthFpEvaluatorProgressTimeoutMs(): number {
  const policy = sdlcOperatorRuntimePolicy();
  return Math.min(
    policy.designDepthFpEvaluatorTimeoutMs,
    Math.max(policy.designDepthFpEvaluatorFirstUpdateTimeoutMs, 300000)
  );
}

function designDepthFpEvaluatorStdoutBudgetBytes(): number {
  return sdlcOperatorRuntimePolicy().designDepthFpEvaluatorStdoutBudgetBytes;
}

function reviewGradeEdgeFulfillmentEvaluatorTimeoutMs(): number {
  return sdlcOperatorRuntimePolicy().reviewGradeEdgeFulfillmentEvaluatorTimeoutMs;
}

function reviewGradeEdgeFulfillmentEvaluatorInactivityTimeoutMs(): number {
  return sdlcOperatorRuntimePolicy()
    .reviewGradeEdgeFulfillmentEvaluatorInactivityTimeoutMs;
}

function reviewGradeEdgeFulfillmentEvaluatorStdoutBudgetBytes(): number {
  return sdlcOperatorRuntimePolicy()
    .reviewGradeEdgeFulfillmentEvaluatorStdoutBudgetBytes;
}

function constrainPlanningTransformWorkerTools(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly transport: SdlcWorkerTransportContract;
  readonly processLaunch: ReturnType<typeof processLaunchForWorker>;
}): ReturnType<typeof processLaunchForWorker> {
  if (sdlcWorkerTargetUsesShellToolProfile(input.manifest)) {
    return input.processLaunch;
  }
  return constrainClaudeProcessLaunchTools({
    transport: input.transport,
    processLaunch: input.processLaunch,
    allowedTools: "Read,Write,Edit,Glob"
  });
}

function constrainReviewGradePlanningEvaluatorTools(input: {
  readonly transport: SdlcWorkerTransportContract;
  readonly processLaunch: ReturnType<typeof processLaunchForWorker>;
}): ReturnType<typeof processLaunchForWorker> {
  return constrainClaudeProcessLaunchTools({
    transport: input.transport,
    processLaunch: input.processLaunch,
    allowedTools: "Read,Write"
  });
}

function ensureWorkerOutputParentDirectory(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot" | "outputFile">
): void {
  if (manifest.outputFile.trim().length === 0) {
    return;
  }
  mkdirSync(dirname(resolve(manifest.workspaceRoot, manifest.outputFile)), {
    recursive: true
  });
}

function fileByteCount(path: string): number {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
}

type SdlcProcessLifecycleArtifactPayload = Readonly<
  Record<string, unknown> & {
    readonly kind: string;
    readonly lifecycleStatus: "started" | "completed" | "interrupted";
    readonly command: string;
    readonly args: readonly string[];
    readonly cwd: string;
  }
>;

function writeProcessLifecycleArtifact(input: {
  readonly archiveRoot: string;
  readonly relativePath: string;
  readonly payload: SdlcProcessLifecycleArtifactPayload;
}): void {
  writeSdlcSystemArtifact({
    archiveRoot: input.archiveRoot,
    relativePath: input.relativePath,
    payload: input.payload
  });
}

function isArchivedTraversalHopSelection(
  input: unknown
): input is SdlcTraversalHopSelection {
  const candidate = jsonRecord(input);
  if (candidate === null) {
    return false;
  }
  return (
    candidate["kind"] === "sdlc_traversal_hop_selection" &&
    typeof candidate["selectionRef"] === "string" &&
    typeof candidate["outcomeClass"] === "string" &&
    typeof candidate["hopClass"] === "string" &&
    typeof candidate["selectedGraphVariantRef"] === "string" &&
    jsonRecord(candidate["complexityAssessment"]) !== null &&
    jsonRecord(candidate["zoomAdmission"]) !== null &&
    jsonRecord(candidate["pressurePreservation"]) !== null &&
    Array.isArray(candidate["rejectedAlternativeRefs"]) &&
    Array.isArray(candidate["blockingReasons"]) &&
    Array.isArray(candidate["evidenceRefs"])
  );
}

function readArchivedFrontDoorTraversalSelection(
  manifest: SdlcWorkerHandoffManifest
): SdlcTraversalHopSelection | null {
  const selectionPath = join(
    manifest.archiveRoot,
    "sdlc_frontdoor_traversal_hop_selection.json"
  );
  if (!existsSync(selectionPath)) {
    return null;
  }
  try {
    const candidate: unknown = JSON.parse(readFileSync(selectionPath, "utf8"));
    return isArchivedTraversalHopSelection(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

function registerProcessInterruptionArtifact(input: {
  readonly archiveRoot: string;
  readonly relativePath: string;
  readonly startedPayload: SdlcProcessLifecycleArtifactPayload;
}): () => void {
  const signalHandlers: Array<readonly [NodeJS.Signals, () => void]> = [];
  const dispose = (): void => {
    for (const [signal, handler] of signalHandlers) {
      process.removeListener(signal, handler);
    }
  };
  for (const signal of Object.freeze(["SIGINT", "SIGTERM", "SIGHUP"] as const)) {
    const handler = (): void => {
      dispose();
      try {
        writeProcessLifecycleArtifact({
          archiveRoot: input.archiveRoot,
          relativePath: input.relativePath,
          payload: Object.freeze({
            ...input.startedPayload,
            lifecycleStatus: "interrupted" as const,
            status: null,
            signal,
            timedOut: false,
            error: "host_signal_before_process_result",
            interruptionSource: "host_signal",
            interruptedAt: new Date().toISOString(),
            hostPid: process.pid
          })
        });
      } finally {
        process.kill(process.pid, signal);
      }
    };
    signalHandlers.push([signal, handler]);
    process.once(signal, handler);
  }
  return dispose;
}

function latestProcessHeartbeat(
  events: readonly RuntimeEvent[]
): Extract<RuntimeEvent, { readonly kind: "actor_process_heartbeat" }> | null {
  let latest: Extract<
    RuntimeEvent,
    { readonly kind: "actor_process_heartbeat" }
  > | null = null;
  for (const event of events) {
    if (event.kind === "actor_process_heartbeat") {
      latest = event;
    }
  }
  return latest;
}

function processSignalSequence(
  events: readonly RuntimeEvent[]
): SdlcWorkerProcessSummary["signalSequence"] {
  return Object.freeze(
    events
      .filter(
        (
          event
        ): event is Extract<
          RuntimeEvent,
          { readonly kind: "actor_process_signal_sent" }
        > => event.kind === "actor_process_signal_sent"
      )
      .map((event) =>
        Object.freeze({
          signal: event.signal,
          elapsedMs: event.elapsedMs
        })
      )
  );
}

function workerProcessSummaryPath(manifest: SdlcWorkerHandoffManifest): string {
  return join(manifest.archiveRoot, "worker_process_summary.json");
}

function workerProcessSummaryRef(manifest: SdlcWorkerHandoffManifest): string {
  return pathToFileURL(workerProcessSummaryPath(manifest)).href;
}

function runtimeLivenessProjectionPath(
  manifest: SdlcWorkerHandoffManifest
): string {
  return join(manifest.archiveRoot, "runtime_liveness_observer_projection.json");
}

function runtimeLivenessProjectionRef(
  manifest: SdlcWorkerHandoffManifest
): string {
  return pathToFileURL(runtimeLivenessProjectionPath(manifest)).href;
}

function workerProcessStartedContextPath(
  manifest: SdlcWorkerHandoffManifest
): string {
  return join(manifest.archiveRoot, "worker_process_started_context.json");
}

function workerProcessStartedContextRef(
  manifest: SdlcWorkerHandoffManifest
): string {
  return pathToFileURL(workerProcessStartedContextPath(manifest)).href;
}

function processStartedRef(manifest: SdlcWorkerHandoffManifest): string {
  return pathToFileURL(join(manifest.archiveRoot, "worker_process_started.json")).href;
}

function processEventsRef(manifest: SdlcWorkerHandoffManifest): string {
  return pathToFileURL(join(manifest.archiveRoot, "worker_process_events.jsonl")).href;
}

function writeWorkerProcessStartedContext(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly manifestPath: string;
  readonly promptPath: string;
  readonly stdoutPath: string;
  readonly stderrPath: string;
  readonly executorProfile: TracedProcessExecutorProfile;
  readonly traceRoot: string;
  readonly policy: ReturnType<typeof workerInactivityPolicy>;
  readonly event: Extract<RuntimeEvent, { readonly kind: "actor_process_started" }>;
}): SdlcWorkerProcessStartedContext {
  const context: SdlcWorkerProcessStartedContext = Object.freeze({
    kind: "sdlc_worker_process_started_context",
    processStartedRef: processStartedRef(input.manifest),
    processEventsRef: processEventsRef(input.manifest),
    manifestRef: pathToFileURL(input.manifestPath).href,
    promptRef: pathToFileURL(input.promptPath).href,
    reportRef: pathToFileURL(input.manifest.reportFile).href,
    outputRef: pathToFileURL(input.manifest.outputFile).href,
    stdoutRef: pathToFileURL(input.stdoutPath).href,
    stderrRef: pathToFileURL(input.stderrPath).href,
    actorInvocationId: input.event.actorInvocationId,
    edge: input.event.edge,
    vectorIndex: input.event.vectorIndex,
    pid: input.event.pid,
    terminalSessionId: input.event.terminalSessionId,
    command: input.event.command,
    args: input.event.args,
    cwd: input.event.cwd,
    executorProfile: input.executorProfile,
    traceRoot: input.traceRoot,
    timeoutMs: input.policy.timeoutMs,
    inactivityTimeoutMs: input.policy.inactivityTimeoutMs,
    heartbeatMs: input.policy.heartbeatMs
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "worker_process_started_context.json",
    payload: context
  });
  return context;
}

function workerRuntimeWatchdogPolicy(input: {
  readonly policy: ReturnType<typeof workerInactivityPolicy>;
  readonly elapsedMs: number | null;
}) {
  return constructRuntimeWatchdogPolicy({
    policyRef: "policy://odd-sdlc/installed-worker-runtime/default",
    startupSilenceLeaseMs: input.policy.inactivityTimeoutMs,
    inactivityLeaseMs: input.policy.inactivityTimeoutMs,
    terminationGraceMs: input.policy.terminationGraceMs,
    hardSafetyCapMs: input.policy.timeoutMs,
    nowElapsedMs: input.elapsedMs,
    retryBudgetRemaining: null
  });
}

const RUNTIME_LIVENESS_ARCHIVE_ACTIVITY_ROW_LIMIT = 12;

function archivedRuntimeLivenessObserverProjection(
  projection: RuntimeLivenessObserverProjection
): Readonly<
  RuntimeLivenessObserverProjection & {
    readonly activityRowCount: number;
    readonly omittedActivityRowCount: number;
  }
> {
  const activityRows = projection.activityRows;
  const omittedActivityRowCount = Math.max(
    0,
    activityRows.length - RUNTIME_LIVENESS_ARCHIVE_ACTIVITY_ROW_LIMIT
  );
  return Object.freeze({
    ...projection,
    activityRows: Object.freeze(
      activityRows.slice(-RUNTIME_LIVENESS_ARCHIVE_ACTIVITY_ROW_LIMIT)
    ),
    activityRowCount: activityRows.length,
    omittedActivityRowCount
  });
}

function writeRuntimeLivenessObserverProjection(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly basis: ExecutionBasis;
  readonly processResult: SupervisedProcessActorResult;
  readonly policy: ReturnType<typeof workerInactivityPolicy>;
}): RuntimeLivenessObserverProjection {
  const basisScopedProcessEvents = runtimeEventsForBasis(
    input.basis,
    input.processResult.events
  );
  const projection = deriveRuntimeLivenessObserverProjection({
    basis: input.basis,
    runtimeProjection: deriveRuntimeAggregateProjection(
      input.basis,
      basisScopedProcessEvents
    ),
    events: basisScopedProcessEvents,
    probeContracts: input.processResult.probeContracts,
    policy: workerRuntimeWatchdogPolicy({
      policy: input.policy,
      elapsedMs: input.processResult.elapsedMs
    })
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "runtime_liveness_observer_projection.json",
    payload: archivedRuntimeLivenessObserverProjection(projection)
  });
  return projection;
}

function writeWorkerProcessSummary(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly manifestPath: string;
  readonly promptPath: string;
  readonly workerRun: SdlcWorkerRunResult;
  readonly processResult: SupervisedProcessActorResult;
  readonly policy: ReturnType<typeof workerInactivityPolicy>;
  readonly livenessProjection: RuntimeLivenessObserverProjection;
}): SdlcWorkerProcessSummary {
  const latestHeartbeat = latestProcessHeartbeat(input.processResult.events);
  const summary: SdlcWorkerProcessSummary = Object.freeze({
    kind: "sdlc_worker_process_summary",
    processStartedRef: processStartedRef(input.manifest),
    processEventsRef: processEventsRef(input.manifest),
    manifestRef: pathToFileURL(input.manifestPath).href,
    promptRef: pathToFileURL(input.promptPath).href,
    reportRef: pathToFileURL(input.manifest.reportFile).href,
    outputRef: pathToFileURL(input.manifest.outputFile).href,
    stdoutRef: pathToFileURL(input.workerRun.stdoutPath).href,
    stderrRef: pathToFileURL(input.workerRun.stderrPath).href,
    pid: input.processResult.pid,
    command: input.workerRun.command,
    args: input.workerRun.args,
    cwd: input.workerRun.cwd,
    ...(input.workerRun.executorProfile === undefined
      ? {}
      : { executorProfile: input.workerRun.executorProfile }),
    ...(input.workerRun.terminalSessionId === undefined
      ? {}
      : { terminalSessionId: input.workerRun.terminalSessionId }),
    ...(input.workerRun.streamModel === undefined
      ? {}
      : { streamModel: input.workerRun.streamModel }),
    ...(input.workerRun.outcome === undefined
      ? {}
      : { outcome: input.workerRun.outcome }),
    ...(input.workerRun.traceRoot === undefined
      ? {}
      : { traceRoot: input.workerRun.traceRoot }),
    ...(input.workerRun.traceResultRef === undefined
      ? {}
      : { traceResultRef: input.workerRun.traceResultRef }),
    ...(input.workerRun.structuredEventCount === undefined
      ? {}
      : { structuredEventCount: input.workerRun.structuredEventCount }),
    ...(input.workerRun.structuredParseFailureCount === undefined
      ? {}
      : {
          structuredParseFailureCount:
            input.workerRun.structuredParseFailureCount
        }),
    ...(input.workerRun.apiRetryCount === undefined
      ? {}
      : { apiRetryCount: input.workerRun.apiRetryCount }),
    ...(input.workerRun.toolCallCount === undefined
      ? {}
      : { toolCallCount: input.workerRun.toolCallCount }),
    ...(input.workerRun.finalOutputRef === undefined
      ? {}
      : { finalOutputRef: input.workerRun.finalOutputRef }),
    ...(input.workerRun.terminalTranscriptRef === undefined
      ? {}
      : { terminalTranscriptRef: input.workerRun.terminalTranscriptRef }),
    timeoutMs: input.policy.timeoutMs,
    inactivityTimeoutMs: input.policy.inactivityTimeoutMs,
    heartbeatMs: input.policy.heartbeatMs,
    runtimeLivenessAuthority:
      "abiogenesis_runtime_liveness_observer_projection",
    runtimeLivenessProjectionRef: runtimeLivenessProjectionRef(input.manifest),
    runtimeLivenessPolicyRef: input.livenessProjection.policyRef,
    runtimeLivenessLeaseState: input.livenessProjection.leaseState,
    runtimeLivenessDispositionAction:
      input.livenessProjection.disposition.action,
    runtimeLivenessDispositionReason:
      input.livenessProjection.disposition.reason,
    lastHeartbeatIndex: latestHeartbeat?.heartbeatIndex ?? null,
    lastHeartbeatElapsedMs: latestHeartbeat?.elapsedMs ?? null,
    signalSequence: processSignalSequence(input.processResult.events),
    status: input.workerRun.status,
    signal: input.workerRun.signal,
    elapsedMs: input.workerRun.elapsedMs,
    timedOut: input.workerRun.timedOut,
    error: input.workerRun.error
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "worker_process_summary.json",
    payload: summary
  });
  return summary;
}

function isUnknownRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function objectValue(input: unknown): Readonly<Record<string, unknown>> | null {
  return isUnknownRecord(input) ? input : null;
}

function stringValue(input: unknown): string | null {
  return typeof input === "string" ? input : null;
}

function numberValue(input: unknown): number | null {
  return typeof input === "number" && Number.isFinite(input) ? input : null;
}

function booleanValue(input: unknown): boolean | null {
  return typeof input === "boolean" ? input : null;
}

function nullableNumberValue(input: unknown): number | null | undefined {
  if (input === null) {
    return null;
  }
  return typeof input === "number" && Number.isFinite(input) ? input : undefined;
}

function nullableStringValue(input: unknown): string | null | undefined {
  if (input === null) {
    return null;
  }
  return typeof input === "string" ? input : undefined;
}

function tracedProcessOutcomeValue(input: unknown): TracedProcessOutcome | null {
  const record = objectValue(input);
  if (record === null) {
    return null;
  }
  const kind = stringValue(record["kind"]);
  if (kind === "exited") {
    const status = numberValue(record["status"]);
    return status === null ? null : Object.freeze({ kind, status });
  }
  if (kind === "signaled") {
    const status = nullableNumberValue(record["status"]);
    const signal = stringValue(record["signal"]);
    return status === undefined || signal === null
      ? null
      : Object.freeze({ kind, status, signal });
  }
  if (kind === "hard_timeout") {
    const timeoutMs = nullableNumberValue(record["timeoutMs"]);
    const signal = nullableStringValue(record["signal"]);
    return timeoutMs === undefined || signal === undefined
      ? null
      : Object.freeze({ kind, timeoutMs, signal });
  }
  if (kind === "inactivity_timeout") {
    const inactivityTimeoutMs = nullableNumberValue(record["inactivityTimeoutMs"]);
    const signal = nullableStringValue(record["signal"]);
    return inactivityTimeoutMs === undefined || signal === undefined
      ? null
      : Object.freeze({ kind, inactivityTimeoutMs, signal });
  }
  if (kind === "executor_unavailable") {
    const reason = stringValue(record["reason"]);
    const detail = stringValue(record["detail"]);
    if (
      (reason !== "screen_missing" && reason !== "screen_shell_unavailable") ||
      detail === null
    ) {
      return null;
    }
    return Object.freeze({ kind, reason, detail });
  }
  if (
    kind === "launch_failed" ||
    kind === "process_error" ||
    kind === "lost_terminal"
  ) {
    const detail = stringValue(record["detail"]);
    return detail === null ? null : Object.freeze({ kind, detail });
  }
  return null;
}

function stringArrayValue(input: unknown): readonly string[] | null {
  if (!Array.isArray(input)) {
    return null;
  }
  const values: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") {
      return null;
    }
    values.push(item);
  }
  return Object.freeze(values);
}

function signalSequenceValue(
  input: unknown
): SdlcWorkerProcessSummary["signalSequence"] | null {
  if (!Array.isArray(input)) {
    return null;
  }
  const values: {
    readonly signal: string;
    readonly elapsedMs: number;
  }[] = [];
  for (const item of input) {
    const record = objectValue(item);
    if (record === null) {
      return null;
    }
    const signal = stringValue(record["signal"]);
    const elapsedMs = numberValue(record["elapsedMs"]);
    if (signal === null || elapsedMs === null) {
      return null;
    }
    values.push(Object.freeze({ signal, elapsedMs }));
  }
  return Object.freeze(values);
}

interface WorkerTraceProjection {
  readonly executorProfile: TracedProcessExecutorProfile | null;
  readonly terminalSessionId: string | null;
  readonly streamModel: TracedProcessStreamModel | null;
  readonly structuredEventCount: number | null;
  readonly structuredParseFailureCount: number | null;
  readonly apiRetryCount: number | null;
  readonly toolCallCount: number | null;
  readonly finalOutputRef: string | null;
  readonly terminalTranscriptRef: string | null;
}

function traceResultPath(traceRoot: string): string {
  return join(traceRoot, "result.json");
}

function fileRef(path: string): string {
  return pathToFileURL(path).href;
}

function optionalPathRef(value: unknown): string | null {
  const path = stringValue(value);
  return path === null ? null : fileRef(path);
}

function traceProjectionFor(traceRoot: string): WorkerTraceProjection {
  const fallback: WorkerTraceProjection = Object.freeze({
    executorProfile: null,
    terminalSessionId: null,
    streamModel: null,
    structuredEventCount: null,
    structuredParseFailureCount: null,
    apiRetryCount: null,
    toolCallCount: null,
    finalOutputRef: null,
    terminalTranscriptRef: null
  });
  if (!existsSync(traceResultPath(traceRoot))) {
    return fallback;
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(traceResultPath(traceRoot), "utf8"));
    const record = objectValue(parsed);
    if (record === null) {
      return fallback;
    }
    const rawExecutorProfile = stringValue(record["executorProfile"]);
    const executorProfile =
      rawExecutorProfile === "local-spawn" || rawExecutorProfile === "pty-terminal"
        ? rawExecutorProfile
        : null;
    const rawStreamModel = stringValue(record["streamModel"]);
    const streamModel =
      rawStreamModel === "stdio" || rawStreamModel === "terminal-transcript"
        ? rawStreamModel
        : null;
    const paths = objectValue(record["paths"]);
    const apiRetryEvents = record["apiRetryEvents"];
    const toolCallEvents = record["toolCallEvents"];
    return Object.freeze({
      executorProfile,
      terminalSessionId:
        record["terminalSessionId"] === null
          ? null
          : stringValue(record["terminalSessionId"]),
      streamModel,
      structuredEventCount: numberValue(record["structuredEventCount"]),
      structuredParseFailureCount: numberValue(
        record["structuredParseFailureCount"]
      ),
      apiRetryCount: Array.isArray(apiRetryEvents) ? apiRetryEvents.length : null,
      toolCallCount: Array.isArray(toolCallEvents) ? toolCallEvents.length : null,
      finalOutputRef:
        paths === null ? null : optionalPathRef(paths["finalOutput"]),
      terminalTranscriptRef:
        paths === null
          ? null
          : optionalPathRef(paths["terminalTranscript"])
    });
  } catch {
    return fallback;
  }
}

function terminalSessionIdFromStartedEvent(
  events: readonly RuntimeEvent[]
): string | null {
  for (const event of events) {
    if (event.kind === "actor_process_started") {
      return event.terminalSessionId;
    }
  }
  return null;
}

type WorkerProcessSummaryAdmission =
  | {
      readonly kind: "admitted";
      readonly summary: SdlcWorkerProcessSummary;
    }
  | {
      readonly kind: "missing" | "invalid";
      readonly detail: string;
    };

function admitWorkerProcessSummary(
  manifest: SdlcWorkerHandoffManifest
): WorkerProcessSummaryAdmission {
  if (!existsSync(workerProcessSummaryPath(manifest))) {
    return Object.freeze({
      kind: "missing",
      detail: `missing:${workerProcessSummaryRef(manifest)}`
    });
  }
  try {
    const parsed: unknown = JSON.parse(
      readFileSync(workerProcessSummaryPath(manifest), "utf8")
    );
    const record = objectValue(parsed);
    if (record === null || record["kind"] !== "sdlc_worker_process_summary") {
      return Object.freeze({
        kind: "invalid",
        detail: "invalid_kind"
      });
    }
    const processStartedRef = stringValue(record["processStartedRef"]);
    const processEventsRef = stringValue(record["processEventsRef"]);
    const manifestRef = stringValue(record["manifestRef"]);
    const promptRef = stringValue(record["promptRef"]);
    const reportRef = stringValue(record["reportRef"]);
    const outputRef = stringValue(record["outputRef"]);
    const stdoutRef = stringValue(record["stdoutRef"]);
    const stderrRef = stringValue(record["stderrRef"]);
    const pid = nullableNumberValue(record["pid"]);
    const command = stringValue(record["command"]);
    const args = stringArrayValue(record["args"]);
    const cwd = stringValue(record["cwd"]);
    const timeoutMs = numberValue(record["timeoutMs"]);
    const inactivityTimeoutMs = numberValue(record["inactivityTimeoutMs"]);
    const heartbeatMs = numberValue(record["heartbeatMs"]);
    const runtimeLivenessAuthority = stringValue(
      record["runtimeLivenessAuthority"]
    );
    const runtimeLivenessProjectionRef = stringValue(
      record["runtimeLivenessProjectionRef"]
    );
    const runtimeLivenessPolicyRef = stringValue(
      record["runtimeLivenessPolicyRef"]
    );
    const runtimeLivenessLeaseState = stringValue(
      record["runtimeLivenessLeaseState"]
    );
    const runtimeLivenessDispositionAction = stringValue(
      record["runtimeLivenessDispositionAction"]
    );
    const runtimeLivenessDispositionReason = stringValue(
      record["runtimeLivenessDispositionReason"]
    );
    const lastHeartbeatIndex = nullableNumberValue(
      record["lastHeartbeatIndex"]
    );
    const lastHeartbeatElapsedMs = nullableNumberValue(
      record["lastHeartbeatElapsedMs"]
    );
    const signalSequence = signalSequenceValue(record["signalSequence"]);
    const status = nullableNumberValue(record["status"]);
    const signal = nullableStringValue(record["signal"]);
    const elapsedMs = numberValue(record["elapsedMs"]);
    const timedOut = booleanValue(record["timedOut"]);
    const error = nullableStringValue(record["error"]);
    const rawExecutorProfile = stringValue(record["executorProfile"]);
    const executorProfile =
      rawExecutorProfile === "local-spawn" || rawExecutorProfile === "pty-terminal"
        ? rawExecutorProfile
        : undefined;
    const rawStreamModel = stringValue(record["streamModel"]);
    const streamModel =
      rawStreamModel === "stdio" || rawStreamModel === "terminal-transcript"
        ? rawStreamModel
        : undefined;
    const rawOutcome = record["outcome"];
    const outcome =
      rawOutcome === undefined ? undefined : tracedProcessOutcomeValue(rawOutcome);
    const traceRoot = stringValue(record["traceRoot"]) ?? undefined;
    const traceResultRef =
      stringValue(record["traceResultRef"]) ?? undefined;
    const structuredEventCount =
      nullableNumberValue(record["structuredEventCount"]) ?? undefined;
    const structuredParseFailureCount =
      nullableNumberValue(record["structuredParseFailureCount"]) ??
      undefined;
    const apiRetryCount =
      nullableNumberValue(record["apiRetryCount"]) ?? undefined;
    const toolCallCount =
      nullableNumberValue(record["toolCallCount"]) ?? undefined;
    const finalOutputRef =
      nullableStringValue(record["finalOutputRef"]) ?? undefined;
    const terminalTranscriptRef =
      nullableStringValue(record["terminalTranscriptRef"]) ??
      undefined;
    if (
      processStartedRef === null ||
      processEventsRef === null ||
      manifestRef === null ||
      promptRef === null ||
      reportRef === null ||
      outputRef === null ||
      stdoutRef === null ||
      stderrRef === null ||
      pid === undefined ||
      command === null ||
      args === null ||
      cwd === null ||
      timeoutMs === null ||
      inactivityTimeoutMs === null ||
      heartbeatMs === null ||
      runtimeLivenessAuthority !==
        "abiogenesis_runtime_liveness_observer_projection" ||
      runtimeLivenessProjectionRef === null ||
      runtimeLivenessPolicyRef === null ||
      runtimeLivenessLeaseState === null ||
      runtimeLivenessDispositionAction === null ||
      runtimeLivenessDispositionReason === null ||
      lastHeartbeatIndex === undefined ||
      lastHeartbeatElapsedMs === undefined ||
      signalSequence === null ||
      status === undefined ||
      signal === undefined ||
      elapsedMs === null ||
      timedOut === null ||
      error === undefined ||
      outcome === null
    ) {
      return Object.freeze({
        kind: "invalid",
        detail: "invalid_fields"
      });
    }
    return Object.freeze({
      kind: "admitted",
      summary: Object.freeze({
        kind: "sdlc_worker_process_summary",
        processStartedRef,
        processEventsRef,
        manifestRef,
        promptRef,
        reportRef,
        outputRef,
        stdoutRef,
        stderrRef,
        pid,
        command,
        args,
        cwd,
        timeoutMs,
        inactivityTimeoutMs,
        heartbeatMs,
        runtimeLivenessAuthority,
        runtimeLivenessProjectionRef,
        runtimeLivenessPolicyRef,
        runtimeLivenessLeaseState,
        runtimeLivenessDispositionAction,
        runtimeLivenessDispositionReason,
        lastHeartbeatIndex,
        lastHeartbeatElapsedMs,
        signalSequence,
        ...(executorProfile === undefined ? {} : { executorProfile }),
        ...(streamModel === undefined ? {} : { streamModel }),
        ...(outcome === undefined ? {} : { outcome }),
        ...(traceRoot === undefined ? {} : { traceRoot }),
        ...(traceResultRef === undefined ? {} : { traceResultRef }),
        ...(structuredEventCount === undefined ? {} : { structuredEventCount }),
        ...(structuredParseFailureCount === undefined
          ? {}
          : { structuredParseFailureCount }),
        ...(apiRetryCount === undefined ? {} : { apiRetryCount }),
        ...(toolCallCount === undefined ? {} : { toolCallCount }),
        ...(finalOutputRef === undefined ? {} : { finalOutputRef }),
        ...(terminalTranscriptRef === undefined ? {} : { terminalTranscriptRef }),
        status,
        signal,
        elapsedMs,
        timedOut,
        error
      })
    });
  } catch {
    return Object.freeze({
      kind: "invalid",
      detail: "parse_failed"
    });
  }
}

async function invokeWorkerThroughAbgProcessActor(input: {
  readonly transport: SdlcWorkerTransportContract;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly manifestPath: string;
  readonly promptPath: string;
  readonly pluginInput: EnginePluginInput;
  readonly basis: ExecutionBasis;
  readonly eventSink: (event: RuntimeEvent) => void;
}): Promise<SdlcWorkerRunResult> {
  const stdoutPath = join(input.manifest.archiveRoot, "worker_stdout.log");
  const stderrPath = join(input.manifest.archiveRoot, "worker_stderr.log");
  const processStartedPath = join(
    input.manifest.archiveRoot,
    "worker_process_started.json"
  );
  const processEventsPath = join(
    input.manifest.archiveRoot,
    "worker_process_events.jsonl"
  );
  const traceRoot = `${processEventsPath}.trace`;
  const outputLastMessagePath =
    input.transport.agentKey === "codex"
      ? join(input.manifest.archiveRoot, "worker_last_message.txt")
      : null;
  const inactivityPolicy = workerInactivityPolicy();
  const executorProfile = selectedWorkerExecutorProfile();
  let startedContextWritten = false;
  ensureWorkerOutputParentDirectory(input.manifest);
  const processLaunch = constrainPlanningTransformWorkerTools({
    manifest: input.manifest,
    transport: input.transport,
    processLaunch: processLaunchForWorker({
      transport: input.transport,
      manifestPath: input.manifestPath,
      manifest: input.manifest,
      promptPath: input.promptPath,
      outputLastMessagePath: outputLastMessagePath ?? "",
      executorProfile
    })
  });
  const workerRunStartedPayload = Object.freeze({
    kind: "sdlc_worker_run_result",
    lifecycleStatus: "started" as const,
    command: processLaunch.command,
    args: processLaunch.args,
    cwd: input.manifest.workspaceRoot,
    executorProfile,
    traceRoot,
    status: null,
    signal: null,
    elapsedMs: 0,
    timedOut: false,
    stdoutByteCount: 0,
    stderrByteCount: 0,
    stdoutPath,
    stderrPath,
    outputLastMessagePath,
    error: null,
    startedAt: new Date().toISOString(),
    hostPid: process.pid,
    processEventsRef: pathToFileURL(processEventsPath).href,
    processStartedRef: pathToFileURL(processStartedPath).href
  });
  writeProcessLifecycleArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "worker_run.json",
    payload: workerRunStartedPayload
  });
  const disposeWorkerInterruptionArtifact = registerProcessInterruptionArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "worker_run.json",
    startedPayload: workerRunStartedPayload
  });
  let processResult: SupervisedProcessActorResult;
  try {
    processResult = await invokeSupervisedProcessActor({
      invocation: actorInvocationForPluginInput({
        pluginInput: input.pluginInput,
        transport: input.transport
      }),
      command: processLaunch.command,
      args: processLaunch.args,
      cwd: input.manifest.workspaceRoot,
	      environment: {
	        ...installedOperatorChildProcessEnvironment(),
	        ...sdlcWorkspaceLocalToolEnvironment(input.manifest.workspaceRoot),
	        ODD_SDLC_OPERATOR_MANIFEST: input.manifestPath,
        ODD_SDLC_OPERATOR_REPORT: input.manifest.reportFile,
        ODD_SDLC_OPERATOR_OUTPUT: input.manifest.outputFile,
        ODD_SDLC_OPERATOR_MATERIALIZATION_ROOT:
          input.manifest.productMaterialization.tenantRoot,
        ODD_SDLC_OPERATOR_MATERIALIZATION_MANIFEST:
          input.manifest.productMaterialization.manifestFile
      },
      environmentPolicy: environmentPolicyForTransport(input.transport),
      stdin: processLaunch.stdin,
      stdoutPath,
      stderrPath,
      stdoutRef: pathToFileURL(stdoutPath).href,
      stderrRef: pathToFileURL(stderrPath).href,
      processStartedPath,
      processEventsPath,
      parser: parserForWorkerTransport(input.transport),
      executorProfile,
      timeoutMs: inactivityPolicy.timeoutMs,
      inactivityTimeoutMs: inactivityPolicy.inactivityTimeoutMs,
      terminationGraceMs: inactivityPolicy.terminationGraceMs,
      heartbeatMs: inactivityPolicy.heartbeatMs,
      eventSink: (event) => {
        if (event.kind === "actor_process_started" && !startedContextWritten) {
          writeWorkerProcessStartedContext({
            manifest: input.manifest,
            manifestPath: input.manifestPath,
            promptPath: input.promptPath,
            stdoutPath,
            stderrPath,
            executorProfile,
            traceRoot,
            policy: inactivityPolicy,
            event
          });
          startedContextWritten = true;
        }
        input.eventSink(event);
      }
    });
  } finally {
    disposeWorkerInterruptionArtifact();
  }
  const stdoutByteCount = fileByteCount(stdoutPath);
  const stderrByteCount = fileByteCount(stderrPath);
  const traceProjection = traceProjectionFor(traceRoot);
  const startedEventTerminalSessionId = terminalSessionIdFromStartedEvent(
    processResult.events
  );
	  const workerRun: SdlcWorkerRunResult = Object.freeze({
    kind: "sdlc_worker_run_result",
    lifecycleStatus: "completed",
    command: processResult.command,
    args: processResult.args,
    cwd: processResult.cwd,
    executorProfile: traceProjection.executorProfile ?? executorProfile,
	    terminalSessionId:
	      startedEventTerminalSessionId ?? traceProjection.terminalSessionId,
    streamModel:
      traceProjection.streamModel ??
      (executorProfile === "pty-terminal" ? "terminal-transcript" : "stdio"),
    outcome: processResult.outcome,
    traceRoot,
    traceResultRef: fileRef(traceResultPath(traceRoot)),
    structuredEventCount: traceProjection.structuredEventCount,
    structuredParseFailureCount: traceProjection.structuredParseFailureCount,
    apiRetryCount: traceProjection.apiRetryCount,
    toolCallCount: traceProjection.toolCallCount,
    finalOutputRef: traceProjection.finalOutputRef,
    terminalTranscriptRef: traceProjection.terminalTranscriptRef,
    status: processResult.status,
    signal: processResult.signal,
    elapsedMs: processResult.elapsedMs,
    timedOut: processResult.timedOut,
    stdoutByteCount,
    stderrByteCount,
    stdoutPath,
    stderrPath,
    outputLastMessagePath,
    error: processResult.error
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "worker_run.json",
    payload: workerRun
  });
  const livenessProjection = writeRuntimeLivenessObserverProjection({
    manifest: input.manifest,
    basis: input.basis,
    processResult,
    policy: inactivityPolicy
  });
  writeWorkerProcessSummary({
    manifest: input.manifest,
    manifestPath: input.manifestPath,
    promptPath: input.promptPath,
    workerRun,
    processResult,
    policy: inactivityPolicy,
    livenessProjection
  });
  return workerRun;
}


function workerResultReportSummaryForDesignDepthPrompt(
  workerReportPath: string
): readonly string[] {
  try {
    const report = objectValue(JSON.parse(readFileSync(workerReportPath, "utf8")));
    if (report === null) {
      return Object.freeze([
        "worker_result_report.json was present but not a JSON object; treat report pressure as unavailable and write an honest partial register."
      ]);
    }
    const obligationAssessments = Array.isArray(report["obligationAssessments"])
      ? report["obligationAssessments"]
      : [];
    const statusCounts = new Map<string, number>();
    const nonFulfilledSamples: string[] = [];
    for (const rawAssessment of obligationAssessments) {
      const assessment = objectValue(rawAssessment);
      if (assessment === null) {
        continue;
      }
      const status =
        stringValue(assessment["fulfillmentStatus"]) ??
        stringValue(assessment["status"]) ??
        "unknown";
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
      if (status !== "fulfilled" && nonFulfilledSamples.length < 8) {
        const obligationId =
          stringValue(assessment["obligationId"]) ??
          stringValue(assessment["id"]) ??
          "unknown";
        nonFulfilledSamples.push(`${obligationId}:${status}`);
      }
    }
    const materializedFiles = Array.isArray(report["materializedFiles"])
      ? report["materializedFiles"].length
      : 0;
    const unresolvedReasons = Array.isArray(report["unresolvedReasons"])
      ? report["unresolvedReasons"].length
      : 0;
    const statusDistribution =
      statusCounts.size === 0
        ? "none"
        : [...statusCounts.entries()]
            .map(([status, count]) => `${status}=${count}`)
            .join(", ");
    const summary = stringValue(report["summary"]);
    return Object.freeze([
      `report kind=${stringValue(report["kind"]) ?? "unknown"}`,
      `obligationAssessments=${obligationAssessments.length}; status field is fulfillmentStatus; distribution=${statusDistribution}`,
      `nonFulfilledSample=${nonFulfilledSamples.length === 0 ? "none" : nonFulfilledSamples.join(", ")}`,
      `materializedFiles=${materializedFiles}; unresolvedReasons=${unresolvedReasons}`,
      `summary=${summary === null ? "none" : summary.slice(0, 240)}`
    ]);
  } catch (error) {
    return Object.freeze([
      `worker_result_report.json could not be summarized by the system (${error instanceof Error ? error.message : "unknown error"}); write an honest partial register instead of timing out.`
    ]);
  }
}

function sourceArtifactPreviewLinesForDesignDepthPrompt(
  sourceArtifactPath: string
): readonly string[] {
  try {
    const text = readFileSync(sourceArtifactPath, "utf8");
    return Object.freeze(
      text
        .split(/\r?\n/u)
        .slice(0, 80)
        .map((line, index) => `L${index + 1}: ${line.slice(0, 240)}`)
    );
  } catch (error) {
    return Object.freeze([
      `source artifact preview unavailable (${error instanceof Error ? error.message : "unknown error"})`
    ]);
  }
}

function designDepthFpEvaluatorCheckpointPrompt(input: {
  readonly contentRegisterPath: string;
  readonly checkpointVerdictPath: string;
  readonly sourceArtifactPath: string;
  readonly sourceArtifactPreviewLines: readonly string[];
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
}): string {
  const compositionContributionRef =
    input.selectedRegimeBindingRef ?? input.selectedCompositionRef;
  const sourceArtifactRef = pathToFileURL(input.sourceArtifactPath).href;
  return [
    "odd_sdlc evaluate.C/F_P design-depth first checkpoint.",
    "",
    "This is a constrained F_P worker call. The framework supplies the carrier grammar, selected identity, and compressed authority packet; the worker chooses the semantic axis statuses, reasons, and evidence refs.",
    "F_D observes/admit/projects the artifact after it is written. F_D does not author the verdict, choose a decomposition, infer satisfaction, or repair the row.",
    "Do not read files. Do not plan. Do not inspect the content register first.",
    "First-response contract: your first visible assistant message must be one Write tool call to the checkpoint verdict path below. Do not emit text, markdown, analysis, planning, or a 'Writing...' preamble before that Write tool call.",
    "The Write tool input file_path must be exactly the checkpoint verdict path below. The content may be compact JSON; pretty printing is not required.",
    "If the worker judges any axis uncertain, still make the Write call and encode that uncertainty as a partial or blocked axis reason.",
    "",
    "Authority packet:",
    `- selectedCompositionRef: ${input.selectedCompositionRef}`,
    `- selectedCompositionDigest: ${input.selectedCompositionDigest}`,
    `- selectedCompositionSelectionRef: ${input.selectedCompositionSelectionRef}`,
    `- selectedRegimeBindingRef: ${input.selectedRegimeBindingRef ?? "null"}`,
    `- compositionContributionRef: ${compositionContributionRef}`,
    `- source artifact ref: ${sourceArtifactRef}`,
    "- compressed source artifact preview:",
    ...(input.sourceArtifactPreviewLines.length === 0
      ? ["  - unavailable"]
      : input.sourceArtifactPreviewLines.map((line) => `  - ${line}`)),
    "",
    `First and only tool action: Write ${input.checkpointVerdictPath}.`,
    `Do not write ${input.contentRegisterPath}; the framework wraps your admitted verdict payload into that carrier after this worker call.`,
    "Write valid JSON with exactly one designCompletenessVerdict payload object.",
    "Choose each axis status and reason from the authority packet. If the packet is insufficient, encode that as the worker's partial or blocked reason.",
    "Do not use canned reasons, placeholder prose, reviewedObligationIds, findings, status, summary, or draft rowRefs.",
    "After the Write succeeds, reply with: checkpoint=written",
    "",
    "Required payload shape:",
    "- kind: \"sdlc_design_completeness_verdict\"",
    "- verdictVersion: \"ts-design-depth-v1\"",
    "- entity, attribute, and flow axis objects.",
    "- Each axis object has exactly kind \"sdlc_design_completeness_axis_verdict\", axis, status, reasons, evidenceRefs.",
    "- Axis status is one of satisfied, partial, blocked. Choose it as the F_P worker from the authority packet.",
    `- Axis reasons are compact worker-authored semantic pressure. Cite ${sourceArtifactRef} in each axis evidenceRefs.`
  ].join("\n");
}

function isDesignCompletenessStatus(
  value: unknown
): value is SdlcDesignCompletenessAxisVerdict["status"] {
  return value === "satisfied" || value === "partial" || value === "blocked";
}

function readCheckpointAxisVerdict(
  input: unknown,
  axis: SdlcDesignCompletenessAxisVerdict["axis"]
): SdlcDesignCompletenessAxisVerdict | null {
  const record = jsonRecord(input);
  if (
    record === null ||
    record["kind"] !== "sdlc_design_completeness_axis_verdict" ||
    record["axis"] !== axis ||
    !isDesignCompletenessStatus(record["status"]) ||
    !isStringList(record["reasons"]) ||
    !isStringList(record["evidenceRefs"])
  ) {
    return null;
  }
  return Object.freeze({
    kind: "sdlc_design_completeness_axis_verdict" as const,
    axis,
    status: record["status"],
    reasons: Object.freeze([...record["reasons"]]),
    evidenceRefs: Object.freeze([...record["evidenceRefs"]])
  });
}

function checkpointAxisInputFromVerdictRecord(
  record: Readonly<Record<string, unknown>>,
  axis: SdlcDesignCompletenessAxisVerdict["axis"]
): unknown {
  if (axis in record) {
    return record[axis];
  }
  const axes = record["axes"];
  if (!Array.isArray(axes)) {
    return null;
  }
  return axes.find((entry) => jsonRecord(entry)?.["axis"] === axis) ?? null;
}

function readDesignDepthCheckpointVerdict(
  checkpointVerdictPath: string
): SdlcDesignCompletenessVerdict | null {
  if (!existsSync(checkpointVerdictPath) || !statSync(checkpointVerdictPath).isFile()) {
    return null;
  }
  try {
    const rawRecord = jsonRecord(
      JSON.parse(readFileSync(checkpointVerdictPath, "utf8"))
    );
    const record = jsonRecord(rawRecord?.["designCompletenessVerdict"]) ?? rawRecord;
    if (
      record === null ||
      (!(("attribute" in record) && ("entity" in record) && ("flow" in record)) &&
        !Array.isArray(record["axes"]))
    ) {
      return null;
    }
    if (
      "kind" in record &&
      record["kind"] !== "sdlc_design_completeness_verdict"
    ) {
      return null;
    }
    if (
      "verdictVersion" in record &&
      record["verdictVersion"] !== "ts-design-depth-v1"
    ) {
      return null;
    }
    const entity = readCheckpointAxisVerdict(
      checkpointAxisInputFromVerdictRecord(record, "entity"),
      "entity"
    );
    const attribute = readCheckpointAxisVerdict(
      checkpointAxisInputFromVerdictRecord(record, "attribute"),
      "attribute"
    );
    const flow = readCheckpointAxisVerdict(
      checkpointAxisInputFromVerdictRecord(record, "flow"),
      "flow"
    );
    if (entity === null || attribute === null || flow === null) {
      return null;
    }
    return Object.freeze({
      kind: "sdlc_design_completeness_verdict" as const,
      verdictVersion: "ts-design-depth-v1" as const,
      entity,
      attribute,
      flow
    });
  } catch {
    return null;
  }
}

function writeDesignDepthCheckpointContentRegister(input: {
  readonly contentRegisterPath: string;
  readonly checkpointVerdictPath: string;
  readonly sourceArtifactPath: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
}): string | null {
  const verdict = readDesignDepthCheckpointVerdict(input.checkpointVerdictPath);
  if (verdict === null) {
    return null;
  }
  const sourceArtifactRef = pathToFileURL(input.sourceArtifactPath).href;
  const compositionContributionRef =
    input.selectedRegimeBindingRef ?? input.selectedCompositionRef;
  const register = Object.freeze({
    kind: "sdlc_evaluate_content_register" as const,
    registerVersion: "ts-evaluate-content-register-v1" as const,
    stage: "evaluate.C" as const,
    ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
    ruleRole: "semantic_judgment" as const,
    computeMeans: "F_P" as const,
    authorityFunction: "synthesize_model" as const,
    selectedCompositionRef: input.selectedCompositionRef,
    selectedCompositionDigest: input.selectedCompositionDigest,
    selectedCompositionSelectionRef: input.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.selectedRegimeBindingRef,
    compositionContributionRef,
    sourceBasisRefs: Object.freeze([sourceArtifactRef]),
    candidateArtifactRefs: Object.freeze([sourceArtifactRef]),
    evidenceRefs: Object.freeze([
      sourceArtifactRef,
      pathToFileURL(input.checkpointVerdictPath).href
    ]),
    contentRows: Object.freeze([
      Object.freeze({
        kind: "sdlc_evaluate_content_register_row" as const,
        rowRef:
          "content-register-row://odd-sdlc/design-depth/checkpoint/designCompletenessVerdict",
        authorityFunction: "synthesize_model" as const,
        carrierFamily: "ProductAssetModel" as const,
        contentKind: SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND,
        payload: Object.freeze({
          kind: "sdlc_design_depth_register_fragment" as const,
          fragmentVersion: "ts-design-depth-fragment-v1" as const,
          targetAssetType: "implementation_design_surface",
          section: "designCompletenessVerdict" as const,
          sequence: 12,
          mergeMode: "replace" as const,
          value: verdict
        }),
        sourceBasisRefs: Object.freeze([sourceArtifactRef]),
        evidenceRefs: Object.freeze([
          sourceArtifactRef,
          pathToFileURL(input.checkpointVerdictPath).href
        ])
      })
    ])
  });
  return writeUtf8FileAtomically({
    targetPath: input.contentRegisterPath,
    content: `${JSON.stringify(register, null, 2)}\n`
  });
}

function writeDesignDepthFirstUpdateObservation(input: {
  readonly archiveRoot: string;
  readonly contentRegisterPath: string;
}): void {
  writeSdlcSystemArtifact({
    archiveRoot: input.archiveRoot,
    relativePath: "design_depth_fp_evaluator_first_update.json",
    payload: observeDesignDepthContentRegisterFirstUpdate({
      registerPath: input.contentRegisterPath
    })
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.archiveRoot,
    relativePath: "design_depth_fp_evaluator_progress_snapshot.json",
    payload: observeDesignDepthContentRegisterProgressSnapshot({
      registerPath: input.contentRegisterPath
    })
  });
}

function designDepthContentRegisterTelemetryPromptLines(input: {
  readonly observedSections: readonly string[];
  readonly missingSections: readonly string[];
}): readonly string[] {
  const nextRepairSection = input.missingSections[0] ?? "none";
  return Object.freeze([
    `- observedSections: ${
      input.observedSections.length === 0
        ? "none"
        : input.observedSections.join(", ")
    }`,
    `- missingSections: ${
      input.missingSections.length === 0 ? "none" : input.missingSections.join(", ")
    }`,
    `- nextRepairSection: ${nextRepairSection}`
  ]);
}

function carryForwardDesignDepthFpEvaluatorContentRegister(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly pluginInput: EnginePluginInput;
  readonly contentRegisterPath: string;
}): boolean {
  if (
    existsSync(input.contentRegisterPath) &&
    statSync(input.contentRegisterPath).isFile()
  ) {
    return false;
  }
  const candidates = predecessorDesignDepthFpEvaluatorContentRegisterPaths(
    input.manifest
  ).filter((candidatePath) => candidatePath !== input.contentRegisterPath);
  let best:
    | {
        readonly registerPath: string;
        readonly register: unknown;
        readonly observation: ReturnType<
          typeof observeDesignDepthContentRegisterFirstUpdate
        >;
      }
    | null = null;
  for (const registerPath of candidates) {
    const admission = admitSdlcEvaluateContentRegisterArtifact({
      registerPath,
      pluginInput: input.pluginInput,
      ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
      authorityFunction: "synthesize_model",
      computeMeans: "F_P"
    });
    if (admission.status !== "admitted" || admission.register === null) {
      continue;
    }
    const observation = observeDesignDepthContentRegisterFirstUpdate({
      registerPath
    });
    if (observation.fragmentRowCount === 0 || observation.draftRowCount > 0) {
      continue;
    }
    if (
      best === null ||
      observation.fragmentRowCount > best.observation.fragmentRowCount ||
      (observation.fragmentRowCount === best.observation.fragmentRowCount &&
        observation.rowCount > best.observation.rowCount)
    ) {
      best = Object.freeze({
        registerPath,
        register: admission.register,
        observation
      });
    }
  }
  if (best === null) {
    return false;
  }
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    absolutePath: input.contentRegisterPath,
    payload: best.register
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "design_depth_fp_evaluator_content_register_carry_forward.json",
    payload: Object.freeze({
      kind: "sdlc_design_depth_fp_evaluator_content_register_carry_forward",
      sourceContentRegisterRef: pathToFileURL(best.registerPath).href,
      targetContentRegisterRef: pathToFileURL(input.contentRegisterPath).href,
      rowCount: best.observation.rowCount,
      fragmentRowCount: best.observation.fragmentRowCount,
      observedSections: best.observation.observedSections,
      missingSections: best.observation.missingSections
    })
  });
  return true;
}

function acceptedDesignDepthFpEvaluatorOutcomeFromCurrentRegister(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly pluginInput: EnginePluginInput;
  readonly contentRegisterPath: string;
  readonly registerPath: string;
  readonly evidenceRefs: readonly string[];
}): EvaluationRuleOutcome | null {
  const contentRegisterAdmission = admitSdlcEvaluateContentRegisterArtifact({
    registerPath: input.contentRegisterPath,
    pluginInput: input.pluginInput,
    ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
    authorityFunction: "synthesize_model",
    computeMeans: "F_P"
  });
  if (
    contentRegisterAdmission.status !== "admitted" ||
    contentRegisterAdmission.register === null
  ) {
    return null;
  }
  let registerProjectionRef: string;
  try {
    registerProjectionRef = writeDesignDepthRegisterProjectionFromEvaluateContentRegister({
      register: contentRegisterAdmission.register,
      archiveRoot: input.manifest.archiveRoot,
      registerPath: input.registerPath
    });
  } catch {
    return null;
  }
  const admission = admitImplementationDesignRegisterCandidateForManifest({
    manifest: input.manifest
  });
  if (admission.status !== "admitted" || admission.register === null) {
    return null;
  }
  return constructEvaluationRuleOutcome({
    status: "accepted",
    ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
    ruleRole: "semantic_judgment",
    computeMeans: "F_P",
    producedRegisterRefs: Object.freeze([
      pathToFileURL(input.contentRegisterPath).href,
      registerProjectionRef
    ]),
    evidenceRefs: uniqueSorted([
      ...input.evidenceRefs,
      ...contentRegisterAdmission.evidenceRefs,
      ...admission.evidenceRefs
    ]),
    findingRefs: Object.freeze([
      `finding://odd-sdlc/${manifestRefSegment(input.manifest)}/evaluate/design-depth-register`
    ]),
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
    compositionContributionRef:
      input.pluginInput.selectedRegimeBindingRef ??
      input.pluginInput.selectedCompositionRef
  });
}

async function materializeDesignDepthRegisterWithFpEvaluator(input: {
  readonly transport: SdlcWorkerTransportContract;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly pluginInput: EnginePluginInput;
  readonly basis: ExecutionBasis;
  readonly eventSink: (event: RuntimeEvent) => void;
}): Promise<EvaluationRuleOutcome> {
  const manifestPath = join(input.manifest.archiveRoot, "handoff_manifest.json");
  const constructionBriefPath = join(
    input.manifest.archiveRoot,
    "worker_construction_brief.json"
  );
  const invocationPackagePath = join(
    input.manifest.archiveRoot,
    "worker_invocation_package.json"
  );
  const workerReportPath = join(input.manifest.archiveRoot, "worker_result_report.json");
  const workCategoryGovernance = selectSdlcWorkCategoryGovernance(input.manifest);
  const governancePath = join(
    input.manifest.workspaceRoot,
    workCategoryGovernance.workerPath
  );
  const contentRegisterPath = designDepthFpEvaluatorContentRegisterPath({
    archiveRoot: input.manifest.archiveRoot
  });
  const carriedForwardContentRegister =
    carryForwardDesignDepthFpEvaluatorContentRegister({
      manifest: input.manifest,
      pluginInput: input.pluginInput,
      contentRegisterPath
    });
  const subworkstreamManifestPath = join(
    input.manifest.archiveRoot,
    SDLC_EVALUATE_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE
  );
  const registerPath = designDepthFpEvaluatorRegisterPath(input.manifest);
  const promptPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_prompt.md"
  );
  writeDesignDepthFirstUpdateObservation({
    archiveRoot: input.manifest.archiveRoot,
    contentRegisterPath
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    absolutePath: subworkstreamManifestPath,
    payload: defaultComputeSubworkstreamManifest({
      manifest: input.manifest,
      stageRef: "evaluate.C",
      source: "parent_checkpoint",
      parentResultRef: pathToFileURL(input.manifest.fpEvaluateResultFile).href
    })
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "design_depth_fp_evaluator_progress_surface.json",
    payload: designDepthContentRegisterProgressSurface()
  });
  const stdoutPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_stdout.log"
  );
  const stderrPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_stderr.log"
  );
  const checkpointPromptPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_checkpoint_prompt.md"
  );
  const checkpointStdoutPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_checkpoint_stdout.log"
  );
  const checkpointStderrPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_checkpoint_stderr.log"
  );
  const checkpointVerdictPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_checkpoint_verdict.json"
  );
  const checkpointProcessStartedPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_checkpoint_process_started.json"
  );
  const checkpointProcessEventsPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_checkpoint_process_events.jsonl"
  );
  const checkpointRunPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_checkpoint_run.json"
  );
  const processStartedPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_process_started.json"
  );
  const processEventsPath = join(
    input.manifest.archiveRoot,
    "design_depth_fp_evaluator_process_events.jsonl"
  );
  const outputLastMessagePath =
    input.transport.agentKey === "codex"
      ? join(input.manifest.archiveRoot, "design_depth_fp_evaluator_last_message.txt")
      : "";
  const executorProfile = selectedWorkerExecutorProfile();
  const inactivityPolicy = workerInactivityPolicy();
  const evaluatorTimeoutMs = designDepthFpEvaluatorTimeoutMs();
  const evaluatorFirstUpdateTimeoutMs = designDepthFpEvaluatorFirstUpdateTimeoutMs();
  const evaluatorProgressTimeoutMs = designDepthFpEvaluatorProgressTimeoutMs();
  const stdoutBudgetBytes = designDepthFpEvaluatorStdoutBudgetBytes();
  const traceRoot = `${processEventsPath}.trace`;
  let lastContentRegisterProgressMetricKey: string | null = null;
  const observeContentRegisterProgress = (): boolean => {
    const current = observeDesignDepthContentRegisterProgressSnapshot({
      registerPath: contentRegisterPath
    });
    if (
      !designDepthContentRegisterProgressAdvanced({
        previousMetricKey: lastContentRegisterProgressMetricKey,
        current
      })
    ) {
      return false;
    }
    lastContentRegisterProgressMetricKey = current.metricKey;
    return true;
  };
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "design_depth_fp_evaluator_checkpoint_prompt.md",
    payload: designDepthFpEvaluatorCheckpointPrompt({
      contentRegisterPath,
      checkpointVerdictPath,
      sourceArtifactPath: input.manifest.outputFile,
      sourceArtifactPreviewLines: sourceArtifactPreviewLinesForDesignDepthPrompt(
        input.manifest.outputFile
      ),
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef ?? null
    })
  });
  const checkpointOutputLastMessagePath =
    input.transport.agentKey === "codex"
      ? join(
          input.manifest.archiveRoot,
          "design_depth_fp_evaluator_checkpoint_last_message.txt"
        )
      : "";
  const checkpointProcessLaunch = constrainClaudeProcessLaunchTools({
    transport: input.transport,
    processLaunch: processLaunchForWorker({
      transport: input.transport,
      manifestPath,
      manifest: input.manifest,
      promptPath: checkpointPromptPath,
      outputLastMessagePath: checkpointOutputLastMessagePath,
      executorProfile
    }),
    allowedTools: "Read,Write"
  });
  if (carriedForwardContentRegister) {
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      absolutePath: checkpointRunPath,
      payload: Object.freeze({
        kind: "sdlc_design_depth_fp_evaluator_checkpoint_run",
        lifecycleStatus: "completed" as const,
        command: "carry_forward",
        args: Object.freeze([]),
        cwd: input.manifest.workspaceRoot,
        status: 0,
        signal: null,
        elapsedMs: 0,
        timedOut: false,
        error: null,
        timeoutMs: evaluatorFirstUpdateTimeoutMs,
        stdoutRef: null,
        stderrRef: null,
        promptRef: pathToFileURL(checkpointPromptPath).href,
        contentRegisterRef: pathToFileURL(contentRegisterPath).href,
        processEventsRef: null,
        traceRoot: null,
        traceResultRef: null,
        reason: "content_register_carried_forward"
      })
    });
  } else {
    const checkpointProcessResult = await invokeSupervisedProcessActor({
      invocation: actorInvocationForPluginInput({
        pluginInput: input.pluginInput,
        transport: input.transport
      }),
      command: checkpointProcessLaunch.command,
      args: checkpointProcessLaunch.args,
      cwd: input.manifest.workspaceRoot,
      environment: {
        ...installedOperatorChildProcessEnvironment(),
        ...sdlcWorkspaceLocalToolEnvironment(input.manifest.workspaceRoot),
        ODD_SDLC_EVALUATE_STAGE: "design_depth_content_register_checkpoint",
        ODD_SDLC_EVALUATOR_CONTENT_REGISTER: contentRegisterPath,
        ODD_SDLC_EVALUATOR_CHECKPOINT_VERDICT: checkpointVerdictPath,
        ODD_SDLC_EVALUATOR_PROMPT: checkpointPromptPath,
        ODD_SDLC_EVALUATOR_SOURCE_ARTIFACT: input.manifest.outputFile,
        ODD_SDLC_EVALUATOR_SELECTED_COMPOSITION_REF:
          input.pluginInput.selectedCompositionRef,
        ODD_SDLC_EVALUATOR_SELECTED_COMPOSITION_DIGEST:
          input.pluginInput.selectedCompositionDigest,
        ODD_SDLC_EVALUATOR_SELECTED_COMPOSITION_SELECTION_REF:
          input.pluginInput.selectedCompositionSelectionRef,
        ODD_SDLC_EVALUATOR_SELECTED_REGIME_BINDING_REF:
          input.pluginInput.selectedRegimeBindingRef ?? "",
        ODD_SDLC_EVALUATOR_COMPOSITION_CONTRIBUTION_REF:
          input.pluginInput.selectedRegimeBindingRef ??
          input.pluginInput.selectedCompositionRef
      },
      environmentPolicy: environmentPolicyForTransport(input.transport),
      stdin: checkpointProcessLaunch.stdin,
      stdoutPath: checkpointStdoutPath,
      stderrPath: checkpointStderrPath,
      stdoutRef: pathToFileURL(checkpointStdoutPath).href,
      stderrRef: pathToFileURL(checkpointStderrPath).href,
      processStartedPath: checkpointProcessStartedPath,
      processEventsPath: checkpointProcessEventsPath,
      parser: parserForWorkerTransport(input.transport),
      executorProfile,
      timeoutMs: evaluatorFirstUpdateTimeoutMs,
      externalProgressTimeoutMs: evaluatorFirstUpdateTimeoutMs,
      externalProgressCheck: observeContentRegisterProgress,
      externalProgressTimeoutReason:
        "design_depth_fp_evaluator_first_update_timeout",
      inactivityTimeoutMs: inactivityPolicy.inactivityTimeoutMs,
      terminationGraceMs: inactivityPolicy.terminationGraceMs,
      heartbeatMs: inactivityPolicy.heartbeatMs,
      eventSink: input.eventSink
    });
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      absolutePath: checkpointRunPath,
      payload: Object.freeze({
        kind: "sdlc_design_depth_fp_evaluator_checkpoint_run",
        lifecycleStatus: "completed" as const,
        command: checkpointProcessResult.command,
        args: checkpointProcessResult.args,
        cwd: checkpointProcessResult.cwd,
        status: checkpointProcessResult.status,
        signal: checkpointProcessResult.signal,
        elapsedMs: checkpointProcessResult.elapsedMs,
        timedOut: checkpointProcessResult.timedOut,
        error: checkpointProcessResult.error,
        timeoutMs: evaluatorFirstUpdateTimeoutMs,
        stdoutRef: pathToFileURL(checkpointStdoutPath).href,
        stderrRef: pathToFileURL(checkpointStderrPath).href,
        promptRef: pathToFileURL(checkpointPromptPath).href,
        contentRegisterRef: pathToFileURL(contentRegisterPath).href,
        processEventsRef: pathToFileURL(checkpointProcessEventsPath).href,
        traceRoot: `${checkpointProcessEventsPath}.trace`,
        traceResultRef: fileRef(
          traceResultPath(`${checkpointProcessEventsPath}.trace`)
        )
      })
    });
    const checkpointCarrierWriteRef = writeDesignDepthCheckpointContentRegister({
      contentRegisterPath,
      checkpointVerdictPath,
      sourceArtifactPath: input.manifest.outputFile,
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef ?? null
    });
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      relativePath: "design_depth_fp_evaluator_checkpoint_carrier_wrap.json",
      payload: Object.freeze({
        kind: "checkpoint_carrier_wrap_observation" as const,
        checkpointVerdictPath,
        contentRegisterPath,
        checkpointVerdictExists: existsSync(checkpointVerdictPath),
        contentRegisterExists: existsSync(contentRegisterPath),
        checkpointCarrierWriteRef,
        checkpointVerdictRef: pathToFileURL(checkpointVerdictPath).href,
        contentRegisterRef: pathToFileURL(contentRegisterPath).href
      })
    });
  }
  writeDesignDepthFirstUpdateObservation({
    archiveRoot: input.manifest.archiveRoot,
    contentRegisterPath
  });
  const checkpointObservation = observeDesignDepthContentRegisterFirstUpdate({
    registerPath: contentRegisterPath
  });
  const checkpointEvidenceRefs = uniqueSorted([
    pathToFileURL(checkpointPromptPath).href,
    pathToFileURL(checkpointStdoutPath).href,
    pathToFileURL(checkpointStderrPath).href,
    pathToFileURL(checkpointVerdictPath).href,
    pathToFileURL(checkpointProcessEventsPath).href,
    pathToFileURL(checkpointRunPath).href,
    pathToFileURL(input.manifest.outputFile).href
  ]);
  if (
    checkpointObservation.status !== "observable" &&
    checkpointObservation.status !== "partial"
  ) {
    return constructEvaluationRuleOutcome({
      status: "blocked",
      ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs: checkpointEvidenceRefs,
      diagnosticRefs: checkpointEvidenceRefs,
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason: "design_depth_fp_evaluator_first_update_timeout"
    });
  }
  if (checkpointObservation.status === "observable") {
    const acceptedCheckpointRegister =
      acceptedDesignDepthFpEvaluatorOutcomeFromCurrentRegister({
        manifest: input.manifest,
        pluginInput: input.pluginInput,
        contentRegisterPath,
        registerPath,
        evidenceRefs: checkpointEvidenceRefs
      });
    if (acceptedCheckpointRegister !== null) {
      return acceptedCheckpointRegister;
    }
  }
  const designDepthPromptProjection = designDepthFpEvaluatorPromptProjection({
    manifest: input.manifest,
    manifestPath,
    governanceRef: workCategoryGovernance.configRef,
    governancePath,
    constructionBriefPath,
    invocationPackagePath,
    workerReportPath,
    workerReportSummaryLines:
      workerResultReportSummaryForDesignDepthPrompt(workerReportPath),
    contentRegisterPath,
    registerProjectionPath: registerPath,
    subworkstreamManifestPath,
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef ?? null,
    sourceArtifactPreviewLines: sourceArtifactPreviewLinesForDesignDepthPrompt(
      input.manifest.outputFile
    ),
    contentRegisterTelemetryLines:
      designDepthContentRegisterTelemetryPromptLines({
        observedSections: checkpointObservation.observedSections,
        missingSections: checkpointObservation.missingSections
      }),
    tenantToolEnvironment: tenantToolEnvironmentProjectionFor(input.manifest)
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "design_depth_fp_evaluator_prompt.md",
    payload: designDepthPromptProjection.promptText
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "design_depth_fp_evaluator_prompt_asset.json",
    payload: designDepthPromptProjection.invocationAsset
  });
  const processLaunch = constrainClaudeProcessLaunchTools({
    transport: input.transport,
    processLaunch: processLaunchForWorker({
      transport: input.transport,
      manifestPath,
      manifest: input.manifest,
      promptPath,
      outputLastMessagePath,
      executorProfile
    }),
    allowedTools: "Read,Write"
  });
  observeContentRegisterProgress();
  const designDepthRunStartedPayload = Object.freeze({
    kind: "sdlc_design_depth_fp_evaluator_run",
    lifecycleStatus: "started" as const,
    command: processLaunch.command,
    args: processLaunch.args,
    cwd: input.manifest.workspaceRoot,
    status: null,
    signal: null,
    elapsedMs: 0,
    timedOut: false,
    error: null,
    timeoutMs: evaluatorTimeoutMs,
    firstUpdateTimeoutMs: evaluatorFirstUpdateTimeoutMs,
    progressTimeoutMs: evaluatorProgressTimeoutMs,
    workerTimeoutMs: inactivityPolicy.timeoutMs,
    stdoutBudgetBytes,
    stdoutByteCount: 0,
    stderrByteCount: 0,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    promptRef: pathToFileURL(promptPath).href,
    contentRegisterRef: pathToFileURL(contentRegisterPath).href,
    registerProjectionRef: pathToFileURL(registerPath).href,
    processEventsRef: pathToFileURL(processEventsPath).href,
    processStartedRef: pathToFileURL(processStartedPath).href,
    traceRoot,
    traceResultRef: fileRef(traceResultPath(traceRoot)),
    startedAt: new Date().toISOString(),
    hostPid: process.pid
  });
  writeProcessLifecycleArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "design_depth_fp_evaluator_run.json",
    payload: designDepthRunStartedPayload
  });
  const disposeDesignDepthInterruptionArtifact = registerProcessInterruptionArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "design_depth_fp_evaluator_run.json",
    startedPayload: designDepthRunStartedPayload
  });
  let processResult: SupervisedProcessActorResult;
  try {
    processResult = await invokeSupervisedProcessActor({
      invocation: actorInvocationForPluginInput({
        pluginInput: input.pluginInput,
        transport: input.transport
      }),
      command: processLaunch.command,
      args: processLaunch.args,
      cwd: input.manifest.workspaceRoot,
      environment: {
        ...installedOperatorChildProcessEnvironment(),
        ...sdlcWorkspaceLocalToolEnvironment(input.manifest.workspaceRoot),
        ODD_SDLC_EVALUATE_STAGE: "design_depth_content_register",
        ODD_SDLC_EVALUATOR_CONTENT_REGISTER: contentRegisterPath,
        ODD_SDLC_EVALUATOR_INCREMENTAL_REGISTER: "1",
        ODD_SDLC_EVALUATOR_INCREMENTAL_FRAGMENT_KIND:
          SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND,
        ODD_SDLC_EVALUATOR_REGISTER_PROJECTION: registerPath,
        ODD_SDLC_EVALUATOR_PROMPT: promptPath,
        ODD_SDLC_EVALUATOR_SOURCE_ARTIFACT: input.manifest.outputFile,
        ODD_SDLC_EVALUATOR_SELECTED_COMPOSITION_REF:
          input.pluginInput.selectedCompositionRef,
        ODD_SDLC_EVALUATOR_SELECTED_COMPOSITION_DIGEST:
          input.pluginInput.selectedCompositionDigest,
        ODD_SDLC_EVALUATOR_SELECTED_COMPOSITION_SELECTION_REF:
          input.pluginInput.selectedCompositionSelectionRef,
        ODD_SDLC_EVALUATOR_SELECTED_REGIME_BINDING_REF:
          input.pluginInput.selectedRegimeBindingRef ?? "",
        ODD_SDLC_EVALUATOR_COMPOSITION_CONTRIBUTION_REF:
          input.pluginInput.selectedRegimeBindingRef ??
          input.pluginInput.selectedCompositionRef
      },
      environmentPolicy: environmentPolicyForTransport(input.transport),
      stdin: processLaunch.stdin,
      stdoutPath,
      stderrPath,
      stdoutRef: pathToFileURL(stdoutPath).href,
      stderrRef: pathToFileURL(stderrPath).href,
      processStartedPath,
      processEventsPath,
      parser: parserForWorkerTransport(input.transport),
      executorProfile,
      timeoutMs: evaluatorTimeoutMs,
      externalProgressTimeoutMs: evaluatorProgressTimeoutMs,
      externalProgressCheck: observeContentRegisterProgress,
      externalProgressMode: "recurring",
      externalProgressTimeoutReason:
        "design_depth_fp_evaluator_progress_timeout",
      inactivityTimeoutMs: inactivityPolicy.inactivityTimeoutMs,
      terminationGraceMs: inactivityPolicy.terminationGraceMs,
      heartbeatMs: inactivityPolicy.heartbeatMs,
      eventSink: input.eventSink
    });
  } finally {
    disposeDesignDepthInterruptionArtifact();
  }
  writeDesignDepthFirstUpdateObservation({
    archiveRoot: input.manifest.archiveRoot,
    contentRegisterPath
  });
  const firstUpdateObservation = observeDesignDepthContentRegisterFirstUpdate({
    registerPath: contentRegisterPath
  });
  const stdoutByteCount = fileByteCount(stdoutPath);
  const stderrByteCount = fileByteCount(stderrPath);
  const runRef = pathToFileURL(
    join(input.manifest.archiveRoot, "design_depth_fp_evaluator_run.json")
  ).href;
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "design_depth_fp_evaluator_run.json",
    payload: Object.freeze({
      kind: "sdlc_design_depth_fp_evaluator_run",
      lifecycleStatus: "completed",
      command: processResult.command,
      args: processResult.args,
      cwd: processResult.cwd,
      status: processResult.status,
      signal: processResult.signal,
      elapsedMs: processResult.elapsedMs,
      timedOut: processResult.timedOut,
      error: processResult.error,
      timeoutMs: evaluatorTimeoutMs,
      firstUpdateTimeoutMs: evaluatorFirstUpdateTimeoutMs,
      progressTimeoutMs: evaluatorProgressTimeoutMs,
      workerTimeoutMs: inactivityPolicy.timeoutMs,
      stdoutBudgetBytes,
      stdoutByteCount,
      stderrByteCount,
      stdoutRef: pathToFileURL(stdoutPath).href,
      stderrRef: pathToFileURL(stderrPath).href,
      promptRef: pathToFileURL(promptPath).href,
      contentRegisterRef: pathToFileURL(contentRegisterPath).href,
      registerProjectionRef: pathToFileURL(registerPath).href,
      processEventsRef: pathToFileURL(processEventsPath).href,
      traceRoot,
      traceResultRef: fileRef(traceResultPath(traceRoot))
    })
  });
  const evaluatorTraceProjection = traceProjectionFor(traceRoot);
  const traceResultRef = fileRef(traceResultPath(traceRoot));
  const evaluatorTraceEvidenceRefs = uniqueSorted([
    traceResultRef,
    ...(evaluatorTraceProjection.finalOutputRef === null
      ? []
      : [evaluatorTraceProjection.finalOutputRef]),
    ...(evaluatorTraceProjection.terminalTranscriptRef === null
      ? []
      : [evaluatorTraceProjection.terminalTranscriptRef])
  ]);
  const evaluatorProcessText = [
    readOptionalWorkerTextRef(evaluatorTraceProjection.finalOutputRef),
    readOptionalWorkerTextRef(evaluatorTraceProjection.terminalTranscriptRef),
    readOptionalWorkerTextRef(traceResultRef),
    readOptionalWorkerTextPath(stdoutPath),
    readOptionalWorkerTextPath(stderrPath)
  ].join("\n");
  const evidenceRefs = uniqueSorted([
    pathToFileURL(promptPath).href,
    pathToFileURL(input.manifest.outputFile).href,
    pathToFileURL(stdoutPath).href,
    pathToFileURL(stderrPath).href,
    pathToFileURL(processEventsPath).href,
    runRef,
    ...evaluatorTraceEvidenceRefs
  ]);
  if (processResult.status !== 0) {
    if (
      processResult.outcome.kind === "external_progress_timeout" &&
      firstUpdateObservation.status !== "pending"
    ) {
      const acceptedCurrentRegister =
        acceptedDesignDepthFpEvaluatorOutcomeFromCurrentRegister({
          manifest: input.manifest,
          pluginInput: input.pluginInput,
          contentRegisterPath,
          registerPath,
          evidenceRefs
        });
      if (acceptedCurrentRegister !== null) {
        return acceptedCurrentRegister;
      }
    }
    return constructEvaluationRuleOutcome({
      status: "blocked",
      ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs,
      diagnosticRefs: evidenceRefs,
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason:
        workerProcessTextLooksRetryableProviderFailure(evaluatorProcessText)
          ? "worker_connection_failed"
          : processResult.outcome.kind === "external_progress_timeout" &&
              processResult.outcome.reason ===
                "design_depth_fp_evaluator_first_update_timeout"
            ? "design_depth_fp_evaluator_first_update_timeout"
            : processResult.timedOut && firstUpdateObservation.status === "pending"
            ? "design_depth_fp_evaluator_first_update_timeout"
            : processResult.timedOut
              ? "design_depth_fp_evaluator_progress_timeout"
              : "design_depth_fp_evaluator_process_failed"
    });
  }
  const contentRegisterAdmission = admitSdlcEvaluateContentRegisterArtifact({
    registerPath: contentRegisterPath,
    pluginInput: input.pluginInput,
    ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
    authorityFunction: "synthesize_model",
    computeMeans: "F_P"
  });
  if (
    contentRegisterAdmission.status !== "admitted" ||
    contentRegisterAdmission.register === null
  ) {
    const diagnosticRefs = uniqueSorted([
      ...evidenceRefs,
      ...contentRegisterAdmission.evidenceRefs
    ]);
    const residualPressureRefs = [
      ...contentRegisterAdmission.blockingReasons.map(
        (reason: string) =>
          `pressure://odd-sdlc/design-depth-fp-evaluator/${encodeURIComponent(reason)}`
      ),
      ...(stdoutByteCount > stdoutBudgetBytes
        ? [
            `pressure://odd-sdlc/design-depth-fp-evaluator/stdout-budget-exceeded/${String(stdoutByteCount)}`
          ]
        : [])
    ];
    return constructEvaluationRuleOutcome({
      status: "blocked",
      ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs: diagnosticRefs,
      residualPressureRefs: Object.freeze(residualPressureRefs),
      diagnosticRefs,
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason: contentRegisterAdmission.blockingReasons.join(",") || "design_depth_fp_evaluator_content_register_rejected"
    });
  }
  let registerProjectionRef: string;
  try {
    registerProjectionRef = writeDesignDepthRegisterProjectionFromEvaluateContentRegister({
      register: contentRegisterAdmission.register,
      archiveRoot: input.manifest.archiveRoot,
      registerPath
    });
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "design_depth_register_projection_failed";
    const diagnosticRefs = uniqueSorted([
      ...evidenceRefs,
      ...contentRegisterAdmission.evidenceRefs
    ]);
    const incompleteRegisterObservation = observeDesignDepthContentRegisterFirstUpdate({
      registerPath: contentRegisterPath
    });
    if (incompleteRegisterObservation.status === "partial") {
      return constructEvaluationRuleOutcome({
        status: "blocked",
        ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
        ruleRole: "semantic_judgment",
        computeMeans: "F_P",
        evidenceRefs: diagnosticRefs,
        residualPressureRefs: Object.freeze([
          `pressure://odd-sdlc/design-depth-fp-evaluator/partial-register/${encodeURIComponent(
            incompleteRegisterObservation.reason ??
              "incomplete_non_draft_fragment_sections"
          )}`,
          `pressure://odd-sdlc/design-depth-fp-evaluator/observed-sections/${encodeURIComponent(
            incompleteRegisterObservation.observedSections.join(",") || "none"
          )}`,
          `pressure://odd-sdlc/design-depth-fp-evaluator/missing-sections/${encodeURIComponent(
            incompleteRegisterObservation.missingSections.join(",") || "none"
          )}`
        ]),
        diagnosticRefs,
        selectedCompositionRef: input.pluginInput.selectedCompositionRef,
        selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
        selectedCompositionSelectionRef:
          input.pluginInput.selectedCompositionSelectionRef,
        selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
        compositionContributionRef:
          input.pluginInput.selectedRegimeBindingRef ??
          input.pluginInput.selectedCompositionRef,
        reason: "design_depth_fp_evaluator_partial_register"
      });
    }
    return constructEvaluationRuleOutcome({
      status: "blocked",
      ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs: diagnosticRefs,
      residualPressureRefs: Object.freeze([
        `pressure://odd-sdlc/design-depth-fp-evaluator/${encodeURIComponent(reason)}`
      ]),
      diagnosticRefs,
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason
    });
  }
  const admission = admitImplementationDesignRegisterCandidateForManifest({
    manifest: input.manifest
  });
  if (admission.status !== "admitted" || admission.register === null) {
    const diagnosticRefs = uniqueSorted([
      ...evidenceRefs,
      ...contentRegisterAdmission.evidenceRefs,
      ...admission.evidenceRefs
    ]);
    const residualPressureRefs = [
      ...admission.blockingReasons.map(
        (reason: string) =>
          `pressure://odd-sdlc/design-depth-fp-evaluator/${encodeURIComponent(reason)}`
      ),
      ...(stdoutByteCount > stdoutBudgetBytes
        ? [
            `pressure://odd-sdlc/design-depth-fp-evaluator/stdout-budget-exceeded/${String(stdoutByteCount)}`
          ]
        : [])
    ];
    return constructEvaluationRuleOutcome({
      status: "blocked",
      ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs: diagnosticRefs,
      residualPressureRefs: Object.freeze(residualPressureRefs),
      diagnosticRefs,
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason: admission.blockingReasons.join(",") || "design_depth_fp_evaluator_register_projection_rejected"
    });
  }
  return constructEvaluationRuleOutcome({
    status: "accepted",
    ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
    ruleRole: "semantic_judgment",
    computeMeans: "F_P",
    producedRegisterRefs: Object.freeze([
      pathToFileURL(contentRegisterPath).href,
      registerProjectionRef
    ]),
    evidenceRefs: uniqueSorted([
      ...evidenceRefs,
      ...contentRegisterAdmission.evidenceRefs,
      ...admission.evidenceRefs
    ]),
    findingRefs: Object.freeze([
      `finding://odd-sdlc/${manifestRefSegment(input.manifest)}/evaluate/design-depth-register`
    ]),
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
    compositionContributionRef:
      input.pluginInput.selectedRegimeBindingRef ??
      input.pluginInput.selectedCompositionRef
  });
}

function writeDesignDepthFpEvaluatorRuleOutcomeProof(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly outcome: EvaluationRuleOutcome;
}): string {
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: DESIGN_DEPTH_FP_EVALUATOR_RULE_OUTCOME_FILE,
    payload: input.outcome
  });
  return pathToFileURL(
    join(input.manifest.archiveRoot, DESIGN_DEPTH_FP_EVALUATOR_RULE_OUTCOME_FILE)
  ).href;
}

function writeReviewGradeEdgeFulfillmentRuleOutcomeProof(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly outcome: EvaluationRuleOutcome;
}): string {
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_OUTCOME_FILE,
    payload: input.outcome
  });
  return pathToFileURL(
    join(input.manifest.archiveRoot, REVIEW_GRADE_EDGE_FULFILLMENT_RULE_OUTCOME_FILE)
  ).href;
}

function designDepthFpEvaluatorBlockingReasonCode(
  outcome: EvaluationRuleOutcome
): SdlcBlockingReasonCode {
  if (outcome.reason === "worker_connection_failed") {
    return "worker_connection_failed";
  }
  if (outcome.reason === "design_depth_fp_evaluator_first_update_timeout") {
    return "design_depth_fp_evaluator_first_update_timeout";
  }
  if (outcome.reason === "design_depth_fp_evaluator_progress_timeout") {
    return "design_depth_fp_evaluator_progress_timeout";
  }
  if (outcome.reason === "design_depth_fp_evaluator_partial_register") {
    return "design_depth_fp_evaluator_pending";
  }
  return outcome.reason === "design_depth_fp_evaluator_process_failed"
    ? "design_depth_fp_evaluator_process_failed"
    : "design_depth_fp_evaluator_rule_blocked";
}

function designDepthFpEvaluatorBlockedPostflight(input: {
  readonly outcome: EvaluationRuleOutcome;
  readonly ruleOutcomeRef: string;
}): SdlcPostflightResult {
  const code = designDepthFpEvaluatorBlockingReasonCode(input.outcome);
  const evidenceRefs = uniqueSorted([
    input.ruleOutcomeRef,
    ...input.outcome.evidenceRefs,
    ...input.outcome.diagnosticRefs,
    ...input.outcome.residualPressureRefs
  ]);
  const carrier = makeSdlcBlockingReason({
    code,
    detail: input.outcome.reason ?? code,
    evidenceRefs
  });
  return Object.freeze({
    kind: "sdlc_operator_postflight_result" as const,
    status: "blocked" as const,
    blockingReasons: Object.freeze([legacyBlockingReasonCode(carrier)]),
    blockingReasonCarriers: Object.freeze([carrier]),
    evidenceRefs
  });
}

function stateWithBlockedDesignDepthFpEvaluatorOutcome(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly outcome: EvaluationRuleOutcome;
  readonly ruleOutcomeRef: string;
}): SdlcAbgOwnedFpDispatchState {
  const postflight = designDepthFpEvaluatorBlockedPostflight({
    outcome: input.outcome,
    ruleOutcomeRef: input.ruleOutcomeRef
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.state.manifest.archiveRoot,
    relativePath: "design_depth_fp_evaluator_postflight.json",
    payload: postflight
  });
  if (input.state.workerReport !== null) {
    writeSdlcFpEvaluateResult({
      manifest: input.state.manifest,
      selectedComposition: input.state.selectedComposition,
      report: input.state.workerReport,
      postflight,
      postflightRef: pathToFileURL(
        join(input.state.manifest.archiveRoot, "design_depth_fp_evaluator_postflight.json")
      ).href
    });
  }
  const blockingReasonCarriers = Object.freeze([
    ...postflight.blockingReasonCarriers,
    ...input.state.blockingReasonCarriers
  ]);
  return Object.freeze({
    ...input.state,
    postflight,
    blockingReason: summarizeBlockingReasons(blockingReasonCarriers),
    blockingReasonCarriers
  });
}


function workerReportWithReviewGradeAssessment(input: {
  readonly report: SdlcWorkerResultReport;
  readonly assessment: SdlcReviewGradeEdgeFulfillmentAssessment;
  readonly targetAssetType: string;
}): SdlcWorkerResultReport {
  const existingById = new Map(
    input.report.obligationAssessments.map((assessment) => [
      assessment.obligationId,
      assessment
    ])
  );
  const findingById = new Map(
    input.assessment.findings.map((finding) => [finding.obligationId, finding])
  );
  const statusWeight = (
    status: SdlcWorkerObligationFulfillmentStatus
  ): number => {
    switch (status) {
      case "fulfilled":
        return 0;
      case "unassessed":
        return 1;
      case "partial":
        return 2;
      case "blocked":
        return 3;
    }
  };
  const stricterStatus = (
    left: SdlcWorkerObligationFulfillmentStatus,
    right: SdlcWorkerObligationFulfillmentStatus
  ): SdlcWorkerObligationFulfillmentStatus =>
    statusWeight(left) >= statusWeight(right) ? left : right;
  const reviewed = new Set(input.assessment.reviewedObligationIds);
  const reviewedRows = input.assessment.reviewedObligationIds.flatMap((obligationId) => {
    const finding = findingById.get(obligationId);
    if (finding === undefined) {
      return [];
    }
    const existing = existingById.get(obligationId);
    const isDownstreamStagePressure =
      reviewGradeFindingsAreDownstreamStagePressure([finding], {
        targetAssetType: input.targetAssetType
      });
    const existingIsDownstreamCarryover =
      isDownstreamStagePressure &&
      existing?.blockingReasons.some((reason) =>
        reason.startsWith("requirement_carried_for_downstream_closure:")
      ) === true;
    const existingBlockingReasons = isDownstreamStagePressure
      ? (existing?.blockingReasons ?? Object.freeze([])).filter(
          (reason) =>
            reason.startsWith("requirement_recorded_for_future_closure:") ||
            reason.startsWith("requirement_carried_for_downstream_closure:")
        )
      : existing?.blockingReasons ?? Object.freeze([]);
    const existingStatus =
      existing === undefined
        ? "fulfilled"
        : isDownstreamStagePressure
          ? "partial"
        : existingIsDownstreamCarryover
          ? "partial"
          : existingBlockingReasons.length > 0 &&
            existing.fulfillmentStatus === "fulfilled"
          ? "blocked"
          : existing.fulfillmentStatus;
    const findingStatus =
      isDownstreamStagePressure ? "partial" : finding.fulfillmentStatus;
    const fulfillmentStatus = stricterStatus(
      existingStatus,
      findingStatus
    );
    const blockingReasons = uniqueSorted([
      ...existingBlockingReasons,
      ...(finding.fulfillmentStatus === "fulfilled"
        ? Object.freeze([])
        : isDownstreamStagePressure
          ? Object.freeze([
              `requirement_carried_for_downstream_closure:${obligationId.replace(/^requirement:/u, "")}`
            ])
        : Object.freeze([
            finding.failureClass ?? "review_grade_open",
            finding.requiredAction ?? "required_action_missing"
          ]))
    ]);
    const requiredAction =
      fulfillmentStatus === "fulfilled"
        ? null
        : finding.requiredAction ?? existing?.blockingReasons[0] ?? "required_action_missing";
    return [
      Object.freeze({
        kind: "sdlc_worker_obligation_assessment" as const,
        obligationId,
        fulfillmentStatus,
        evidenceRefs: uniqueSorted([
          ...(existing?.evidenceRefs ?? Object.freeze([])),
          ...finding.evidenceRefs,
          ...input.assessment.evidenceRefs
        ]),
        blockingReasons,
        reviewGrade: true,
        reviewFailureClass: finding.failureClass,
        requiredAction,
        semanticEvidenceRefs: finding.evidenceRefs,
        acceptedAuthorityRefs: finding.acceptedAuthorityRefs,
        fulfillmentBinding: finding.fulfillmentBinding,
        repairSurfaceTriage: finding.repairSurfaceTriage ?? null
      })
    ];
  });
  const unreviewedRows = input.report.obligationAssessments.filter(
    (assessment) => !reviewed.has(assessment.obligationId)
  );
  return Object.freeze({
    ...input.report,
    obligationAssessments: Object.freeze([...reviewedRows, ...unreviewedRows])
  });
}

function reviewGradePostflight(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly code: SdlcBlockingReasonCode;
  readonly details: readonly string[];
  readonly evidenceRefs: readonly string[];
}): SdlcPostflightResult {
  const detail =
    input.details.length === 0 ? input.code : input.details.slice(0, 12).join("; ");
  const carrier = makeSdlcBlockingReason({
    code: input.code,
    detail,
    evidenceRefs: input.evidenceRefs
  });
  return Object.freeze({
    kind: "sdlc_operator_postflight_result" as const,
    status: "blocked" as const,
    blockingReasons: Object.freeze([legacyBlockingReasonCode(carrier)]),
    blockingReasonCarriers: Object.freeze([carrier]),
    evidenceRefs: input.evidenceRefs
  });
}

async function materializeReviewGradeEdgeFulfillmentWithFpEvaluator(input: {
  readonly transport: SdlcWorkerTransportContract;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly pluginInput: EnginePluginInput;
  readonly eventSink: (event: RuntimeEvent) => void;
}): Promise<EvaluationRuleOutcome> {
  const manifestPath = join(input.manifest.archiveRoot, "handoff_manifest.json");
  const constructionBriefPath = join(
    input.manifest.archiveRoot,
    "worker_construction_brief.json"
  );
  const invocationPackagePath = join(
    input.manifest.archiveRoot,
    "worker_invocation_package.json"
  );
  const workerReportPath = join(input.manifest.archiveRoot, "worker_result_report.json");
  const workCategoryGovernance = selectSdlcWorkCategoryGovernance(input.manifest);
  const assessmentPath = join(
    input.manifest.archiveRoot,
    REVIEW_GRADE_EDGE_FULFILLMENT_ASSESSMENT_FILE
  );
  const subworkstreamManifestPath = join(
    input.manifest.archiveRoot,
    SDLC_EVALUATE_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE
  );
  const promptPath = join(
    input.manifest.archiveRoot,
    "review_grade_edge_fulfillment_prompt.md"
  );
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    absolutePath: subworkstreamManifestPath,
    payload: defaultComputeSubworkstreamManifest({
      manifest: input.manifest,
      stageRef: "evaluate.C",
      source: "parent_checkpoint",
      parentResultRef: pathToFileURL(input.manifest.fpEvaluateResultFile).href
    })
  });
  const reviewGradePromptProjection = reviewGradeEdgeFulfillmentPromptProjection({
    manifest: input.manifest,
    invocationScope: readWorkerInvocationPackageScope(invocationPackagePath),
    governanceRef: workCategoryGovernance.configRef,
    governancePath: join(input.manifest.workspaceRoot, workCategoryGovernance.workerPath),
    constructionBriefPath,
    invocationPackagePath,
    workerReportPath,
    assessmentPath,
    subworkstreamManifestPath,
    tenantToolEnvironment: tenantToolEnvironmentProjectionFor(input.manifest)
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "review_grade_edge_fulfillment_prompt.md",
    payload: reviewGradePromptProjection.promptText
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "review_grade_edge_fulfillment_prompt_asset.json",
    payload: reviewGradePromptProjection.invocationAsset
  });
  const stdoutPath = join(
    input.manifest.archiveRoot,
    "review_grade_edge_fulfillment_stdout.log"
  );
  const stderrPath = join(
    input.manifest.archiveRoot,
    "review_grade_edge_fulfillment_stderr.log"
  );
  const processStartedPath = join(
    input.manifest.archiveRoot,
    "review_grade_edge_fulfillment_process_started.json"
  );
  const processEventsPath = join(
    input.manifest.archiveRoot,
    "review_grade_edge_fulfillment_process_events.jsonl"
  );
  const outputLastMessagePath =
    input.transport.agentKey === "codex"
      ? join(input.manifest.archiveRoot, "review_grade_edge_fulfillment_last_message.txt")
      : "";
  const executorProfile = selectedWorkerExecutorProfile();
  const processLaunch = constrainReviewGradePlanningEvaluatorTools({
    transport: input.transport,
    processLaunch: processLaunchForWorker({
      transport: input.transport,
      manifestPath,
      manifest: input.manifest,
      promptPath,
      outputLastMessagePath,
      executorProfile
    })
  });
  const reviewGradeWorkerReport = admitWorkerResultReport(
    JSON.parse(readFileSync(workerReportPath, "utf8")),
    input.manifest
  );
  const readOnlyInputSnapshot = snapshotReviewGradeReadOnlyInputFiles({
    manifest: input.manifest,
    report: reviewGradeWorkerReport,
    additionalInputFiles: Object.freeze([
      manifestPath,
      constructionBriefPath,
      invocationPackagePath,
      workerReportPath,
      input.manifest.fpTransformResultFile,
      input.manifest.fpEvaluateResultFile,
      input.manifest.productMaterialization.manifestFile
    ])
  });
  const inactivityPolicy = workerInactivityPolicy();
  const evaluatorTimeoutMs = reviewGradeEdgeFulfillmentEvaluatorTimeoutMs();
  const evaluatorInactivityTimeoutMs =
    reviewGradeEdgeFulfillmentEvaluatorInactivityTimeoutMs();
  const stdoutBudgetBytes = reviewGradeEdgeFulfillmentEvaluatorStdoutBudgetBytes();
  const traceRoot = `${processEventsPath}.trace`;
  const reviewGradeRunStartedPayload = Object.freeze({
    kind: "sdlc_review_grade_edge_fulfillment_run",
    lifecycleStatus: "started" as const,
    command: processLaunch.command,
    args: processLaunch.args,
    cwd: input.manifest.workspaceRoot,
    status: null,
    signal: null,
    elapsedMs: 0,
    timedOut: false,
    error: null,
    timeoutMs: evaluatorTimeoutMs,
    workerTimeoutMs: inactivityPolicy.timeoutMs,
    inactivityTimeoutMs: evaluatorInactivityTimeoutMs,
    stdoutBudgetBytes,
    stdoutByteCount: 0,
    stderrByteCount: 0,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    promptRef: pathToFileURL(promptPath).href,
    assessmentRef: pathToFileURL(assessmentPath).href,
    processEventsRef: pathToFileURL(processEventsPath).href,
    processStartedRef: pathToFileURL(processStartedPath).href,
    traceRoot,
    traceResultRef: fileRef(traceResultPath(traceRoot)),
    startedAt: new Date().toISOString(),
    hostPid: process.pid
  });
  writeProcessLifecycleArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "review_grade_edge_fulfillment_run.json",
    payload: reviewGradeRunStartedPayload
  });
  const disposeReviewGradeInterruptionArtifact = registerProcessInterruptionArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "review_grade_edge_fulfillment_run.json",
    startedPayload: reviewGradeRunStartedPayload
  });
  let processResult: SupervisedProcessActorResult;
  try {
    processResult = await invokeSupervisedProcessActor({
    invocation: actorInvocationForPluginInput({
      pluginInput: input.pluginInput,
      transport: input.transport
    }),
    command: processLaunch.command,
    args: processLaunch.args,
    cwd: input.manifest.workspaceRoot,
	    environment: {
	      ...installedOperatorChildProcessEnvironment(),
	      ...sdlcWorkspaceLocalToolEnvironment(input.manifest.workspaceRoot),
	      ODD_SDLC_EVALUATE_STAGE: "review_grade_edge_fulfillment",
      ODD_SDLC_EVALUATOR_ASSESSMENT: assessmentPath,
      ODD_SDLC_EVALUATOR_PROMPT: promptPath,
      ODD_SDLC_EVALUATOR_WORKER_REPORT: workerReportPath
    },
    environmentPolicy: environmentPolicyForTransport(input.transport),
    stdin: processLaunch.stdin,
    stdoutPath,
    stderrPath,
    stdoutRef: pathToFileURL(stdoutPath).href,
    stderrRef: pathToFileURL(stderrPath).href,
    processStartedPath,
    processEventsPath,
    parser: parserForWorkerTransport(input.transport),
    executorProfile,
    timeoutMs: evaluatorTimeoutMs,
    inactivityTimeoutMs: evaluatorInactivityTimeoutMs,
    terminationGraceMs: inactivityPolicy.terminationGraceMs,
    heartbeatMs: inactivityPolicy.heartbeatMs,
    eventSink: input.eventSink
  });
  } finally {
    disposeReviewGradeInterruptionArtifact();
  }
  const stdoutByteCount = fileByteCount(stdoutPath);
  const stderrByteCount = fileByteCount(stderrPath);
  const runRef = pathToFileURL(
    join(input.manifest.archiveRoot, "review_grade_edge_fulfillment_run.json")
  ).href;
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "review_grade_edge_fulfillment_run.json",
    payload: Object.freeze({
      kind: "sdlc_review_grade_edge_fulfillment_run",
      lifecycleStatus: "completed",
      command: processResult.command,
      args: processResult.args,
      cwd: processResult.cwd,
      status: processResult.status,
      signal: processResult.signal,
      elapsedMs: processResult.elapsedMs,
      timedOut: processResult.timedOut,
      error: processResult.error,
      timeoutMs: evaluatorTimeoutMs,
      workerTimeoutMs: inactivityPolicy.timeoutMs,
      inactivityTimeoutMs: evaluatorInactivityTimeoutMs,
      stdoutBudgetBytes,
      stdoutByteCount,
      stderrByteCount,
      stdoutRef: pathToFileURL(stdoutPath).href,
      stderrRef: pathToFileURL(stderrPath).href,
      promptRef: pathToFileURL(promptPath).href,
      assessmentRef: pathToFileURL(assessmentPath).href,
      processEventsRef: pathToFileURL(processEventsPath).href,
      traceRoot,
      traceResultRef: fileRef(traceResultPath(traceRoot))
    })
  });
  const evidenceRefs = uniqueSorted([
    pathToFileURL(promptPath).href,
    pathToFileURL(workerReportPath).href,
    pathToFileURL(input.manifest.outputFile).href,
    pathToFileURL(stdoutPath).href,
    pathToFileURL(stderrPath).href,
    pathToFileURL(processEventsPath).href,
    pathToFileURL(processStartedPath).href,
    runRef
  ]);
  const evaluatorMutationReasons = reviewGradeReadOnlyInputMutationReasons({
    snapshot: readOnlyInputSnapshot
  });
  if (evaluatorMutationReasons.length > 0) {
    const diagnosticRefs = uniqueSorted([
      ...evidenceRefs,
      ...readOnlyInputSnapshot.files.map((file) => pathToFileURL(file.path).href)
    ]);
    const postflight = reviewGradePostflight({
      manifest: input.manifest,
      code: "review_grade_evaluator_mutated_input",
      details: evaluatorMutationReasons,
      evidenceRefs: diagnosticRefs
    });
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      relativePath: "review_grade_postflight.json",
      payload: postflight
    });
    writePostflightGapDossier({
      manifest: input.manifest,
      gapDossier: constructPostflightGapDossier({
        manifest: input.manifest,
        postflight
      })
    });
    return constructEvaluationRuleOutcome({
      status: "blocked",
      ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs: diagnosticRefs,
      residualPressureRefs: evaluatorMutationReasons.map(
        (reason) =>
          `pressure://odd-sdlc/review-grade/${manifestRefSegment(input.manifest)}/${encodeURIComponent(reason)}`
      ),
      diagnosticRefs,
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason: "review_grade_evaluator_mutated_input"
    });
  }
  if (processResult.status !== 0) {
    const processFailureReason =
      processResult.timedOut === true
        ? "review_grade_evaluator_process_timeout"
        : "review_grade_evaluator_process_failed";
    const postflight = reviewGradePostflight({
      manifest: input.manifest,
      code: processFailureReason,
      details: [
        processResult.signal === null || processResult.signal === undefined
          ? processFailureReason
          : `${processFailureReason}:${processResult.signal}`
      ],
      evidenceRefs
    });
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      relativePath: "review_grade_postflight.json",
      payload: postflight
    });
    writePostflightGapDossier({
      manifest: input.manifest,
      gapDossier: constructPostflightGapDossier({
        manifest: input.manifest,
        postflight
      })
    });
    const residualPressureRefs = Object.freeze([
      `pressure://odd-sdlc/review-grade/${manifestRefSegment(input.manifest)}/${processFailureReason}`
    ]);
    return constructEvaluationRuleOutcome({
      status: "blocked",
      ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs,
      residualPressureRefs,
      diagnosticRefs: evidenceRefs,
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason: processFailureReason
    });
  }
  const admission = admitReviewGradeEdgeFulfillmentAssessmentFromArtifact({
    manifest: input.manifest,
    outputFile: assessmentPath
  });
  if (admission.status !== "admitted" || admission.assessment === null) {
    const postflight = reviewGradePostflight({
      manifest: input.manifest,
      code: admission.status === "not_required"
        ? "review_grade_assessment_missing"
        : "review_grade_assessment_invalid",
      details: admission.blockingReasons,
      evidenceRefs: uniqueSorted([...evidenceRefs, ...admission.evidenceRefs])
    });
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      relativePath: "review_grade_postflight.json",
      payload: postflight
    });
    writePostflightGapDossier({
      manifest: input.manifest,
      gapDossier: constructPostflightGapDossier({
        manifest: input.manifest,
        postflight
      })
    });
    const diagnosticRefs = uniqueSorted([
      ...evidenceRefs,
      ...admission.evidenceRefs
    ]);
    return constructEvaluationRuleOutcome({
      status: "blocked",
      ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs: diagnosticRefs,
      residualPressureRefs: admission.blockingReasons.map(
        (reason) =>
          `pressure://odd-sdlc/review-grade/${manifestRefSegment(input.manifest)}/${encodeURIComponent(reason)}`
      ),
      diagnosticRefs,
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason: admission.blockingReasons.join(",") || "review_grade_assessment_rejected"
    });
  }
  const openFindings = admission.assessment.findings.filter(
    (finding) => finding.fulfillmentStatus !== "fulfilled"
  );
  if (
    admission.assessment.status === "passed" &&
    reviewGradeFindingsAreDownstreamStagePressure(openFindings, {
      targetAssetType: input.manifest.targetAssetType
    })
  ) {
    const downstreamPressureRefs = uniqueSorted(
      openFindings.map(
        (finding) =>
          `pressure://odd-sdlc/review-grade/${manifestRefSegment(input.manifest)}/${encodeURIComponent(finding.obligationId)}`
      )
    );
    return constructEvaluationRuleOutcome({
      status: "accepted",
      ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs: uniqueSorted([...evidenceRefs, ...admission.evidenceRefs]),
      residualPressureRefs: downstreamPressureRefs,
      diagnosticRefs: downstreamPressureRefs,
      findingRefs: Object.freeze([
        `finding://odd-sdlc/${manifestRefSegment(input.manifest)}/evaluate/review-grade-edge-fulfillment/downstream-stage-pressure`
      ]),
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason: openFindings
        .map((finding) => `${finding.obligationId}:wrong_stage`)
        .join(",")
    });
  }
  if (admission.assessment.status === "blocked" || openFindings.length > 0) {
    const postflight = reviewGradePostflight({
      manifest: input.manifest,
      code: "review_grade_edge_fulfillment_blocked",
      details: openFindings.map(
        (finding) =>
          `${finding.obligationId}:${finding.failureClass ?? "open"}:${finding.requiredAction ?? "required_action_missing"}`
      ),
      evidenceRefs: uniqueSorted([...evidenceRefs, ...admission.evidenceRefs])
    });
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      relativePath: "review_grade_postflight.json",
      payload: postflight
    });
    writePostflightGapDossier({
      manifest: input.manifest,
      gapDossier: constructPostflightGapDossier({
        manifest: input.manifest,
        postflight
      })
    });
    const residualPressureRefs = uniqueSorted(
      openFindings.map(
        (finding) =>
          `pressure://odd-sdlc/review-grade/${manifestRefSegment(input.manifest)}/${encodeURIComponent(finding.obligationId)}`
      )
    );
    return constructEvaluationRuleOutcome({
      status: "accepted",
      ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
      ruleRole: "semantic_judgment",
      computeMeans: "F_P",
      evidenceRefs: uniqueSorted([...evidenceRefs, ...admission.evidenceRefs]),
      residualPressureRefs,
      diagnosticRefs: residualPressureRefs,
      findingRefs: Object.freeze([
        `finding://odd-sdlc/${manifestRefSegment(input.manifest)}/evaluate/review-grade-edge-fulfillment`
      ]),
      selectedCompositionRef: input.pluginInput.selectedCompositionRef,
      selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        input.pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        input.pluginInput.selectedRegimeBindingRef ??
        input.pluginInput.selectedCompositionRef,
      reason: openFindings
        .map((finding) => `${finding.obligationId}:${finding.failureClass ?? "open"}`)
        .join(",")
    });
  }
  return constructEvaluationRuleOutcome({
    status: "accepted",
    ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
    ruleRole: "semantic_judgment",
    computeMeans: "F_P",
    evidenceRefs: uniqueSorted([...evidenceRefs, ...admission.evidenceRefs]),
    findingRefs: Object.freeze([
      `finding://odd-sdlc/${manifestRefSegment(input.manifest)}/evaluate/review-grade-edge-fulfillment`
    ]),
    selectedCompositionRef: input.pluginInput.selectedCompositionRef,
    selectedCompositionDigest: input.pluginInput.selectedCompositionDigest,
    selectedCompositionSelectionRef:
      input.pluginInput.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.pluginInput.selectedRegimeBindingRef,
    compositionContributionRef:
      input.pluginInput.selectedRegimeBindingRef ??
      input.pluginInput.selectedCompositionRef
  });
}

function fulfillmentArtifact(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly transport: SdlcWorkerTransportContract;
  readonly basis: ExecutionBasis;
  readonly expectedAssessmentIds: readonly string[];
  readonly fulfillmentStatus: "fulfilled" | "partial" | "blocked" | "unfulfilled";
  readonly fulfillmentDetail: string;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}): Readonly<Record<string, unknown>> {
  const assessmentIds =
    input.expectedAssessmentIds.length === 0
      ? Object.freeze(["runtime_fulfilled"])
      : input.expectedAssessmentIds;
  return Object.freeze({
    edge: input.manifest.edgeName,
    actor: input.transport.workerId,
    fulfillment_assessments: assessmentIds.map((id) =>
      Object.freeze({
        id,
        evaluator: id,
        fulfillment_status: input.fulfillmentStatus,
        fulfillment_detail: input.fulfillmentDetail,
        blocking_reasons: input.blockingReasons,
        evidence_refs: input.evidenceRefs
      })
    ),
    selected_worker_id: input.transport.workerId,
    selected_backend: input.transport.backendId,
    role_id: "role://odd-sdlc/fp-worker",
    assignment_source: "installed_worker_transport",
    resolved_runtime_ref: input.basis.runtimeIdentity.resolvedRuntimeRef
  });
}

function deterministicFulfillmentArtifact(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly basis: ExecutionBasis;
  readonly expectedAssessmentIds: readonly string[];
  readonly fulfillmentStatus: "fulfilled" | "partial" | "blocked" | "unfulfilled";
  readonly fulfillmentDetail: string;
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}): Readonly<Record<string, unknown>> {
  const assessmentIds =
    input.expectedAssessmentIds.length === 0
      ? Object.freeze(["runtime_fulfilled"])
      : input.expectedAssessmentIds;
  return Object.freeze({
    edge: input.manifest.edgeName,
    actor: "installed_operator",
    fulfillment_assessments: assessmentIds.map((id) =>
      Object.freeze({
        id,
        evaluator: id,
        fulfillment_status: input.fulfillmentStatus,
        fulfillment_detail: input.fulfillmentDetail,
        blocking_reasons: input.blockingReasons,
        evidence_refs: input.evidenceRefs
      })
    ),
    selected_worker_id: null,
    selected_backend: "installed_operator_deterministic_edge",
    role_id: "role://odd-sdlc/installed-operator",
    assignment_source: "edge_accounting.worker_dispatch_disallowed",
    resolved_runtime_ref: input.basis.runtimeIdentity.resolvedRuntimeRef
  });
}

interface SdlcAbgOwnedFpDispatchState {
  readonly status: SdlcInstalledOperatorStatus;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly workerRun: SdlcWorkerRunResult | null;
  readonly workerReport: SdlcWorkerResultReport | null;
  readonly postflight: SdlcPostflightResult | null;
  readonly assuranceSatisfaction: SdlcInstalledOperatorStartOutcome["assuranceSatisfaction"];
  readonly gapDossier: SdlcPostflightGapDossier | null;
  readonly hookOutcome: SdlcHookTurnOutcome | null;
  readonly blockingReason: string | null;
  readonly blockingReasonCarriers: readonly SdlcBlockingReason[];
  readonly currentEdge: string | null;
}

async function appendFdConformanceRuntimeEvents(input: {
  readonly workspaceRoot: string;
  readonly basis: ExecutionBasis;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly reportRef: string;
}): Promise<readonly RuntimeEvent[]> {
  const firstTraversalBasis: ExecutionBasis = Object.freeze({
    ...input.basis,
    startIntent: Object.freeze({
      ...input.basis.startIntent,
      until: "first_traversal" as const
    })
  });
  const runner = await runEngineIterateAsync({
    basis: firstTraversalBasis,
    runtimeEvents: input.replayEvents,
    eventSink: () => undefined,
    plugins: Object.freeze({
      fdEvaluator: Object.freeze({
        contract: defaultFdEvaluatorPlugin.contract,
        evaluate: () =>
          constructFdEvaluationOutcome({
            status: "accepted",
            evidenceRefs: [input.reportRef],
            reason: "project conformance materialized by SDLC; ABG owns F_D traversal event authorship"
          })
      })
    })
  });
  const emitted = Object.freeze([...runner.emittedEvents]);
  await appendOddSdlcRuntimeEvents({
    workspaceRoot: input.workspaceRoot,
    events: emitted
  });
  return emitted;
}

function workerReportAdmissionPostflight(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly workerRun: SdlcWorkerRunResult;
  readonly reason: string;
}): SdlcPostflightResult {
  const evidenceRefs = Object.freeze([
    pathToFileURL(input.manifest.reportFile).href,
    ...workerProcessEvidenceRefs(input),
    ...(input.workerRun.outputLastMessagePath === null
      ? []
      : [pathToFileURL(input.workerRun.outputLastMessagePath).href])
  ]);
  const carrier = makeSdlcBlockingReason({
    code: "worker_report_admission_failed",
    detail: input.reason,
    lawfulReentryPoint: "operator_blocked",
    evidenceRefs
  });
  return Object.freeze({
    kind: "sdlc_operator_postflight_result" as const,
    status: "diagnostic" as const,
    blockingReasons: Object.freeze([]),
    blockingReasonCarriers: Object.freeze([carrier]),
    evidenceRefs
  });
}

function deterministicReportAdmissionPostflight(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly reason: string;
}): SdlcPostflightResult {
  const evidenceRefs = Object.freeze([
    pathToFileURL(input.manifest.reportFile).href,
    ...workerProcessEvidenceRefs({
      manifest: input.manifest,
      workerRun: null
    })
  ]);
  const carrier = makeSdlcBlockingReason({
    code: "worker_report_admission_failed",
    detail: input.reason,
    lawfulReentryPoint: "operator_blocked",
    evidenceRefs
  });
  return Object.freeze({
    kind: "sdlc_operator_postflight_result" as const,
    status: "diagnostic" as const,
    blockingReasons: Object.freeze([]),
    blockingReasonCarriers: Object.freeze([carrier]),
    evidenceRefs
  });
}

function workerProcessEvidenceRefs(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly workerRun: SdlcWorkerRunResult | null;
}): readonly string[] {
  if (input.workerRun === null) {
    return Object.freeze([
      pathToFileURL(join(input.manifest.archiveRoot, "handoff_manifest.json")).href,
      pathToFileURL(join(input.manifest.archiveRoot, "worker_construction_brief.json")).href,
      pathToFileURL(join(input.manifest.archiveRoot, "traversal_intent_package.json")).href
    ]);
  }
  return Object.freeze([
    pathToFileURL(join(input.manifest.archiveRoot, "worker_run.json")).href,
    workerProcessStartedContextRef(input.manifest),
    workerProcessSummaryRef(input.manifest),
    runtimeLivenessProjectionRef(input.manifest),
    pathToFileURL(input.workerRun.stdoutPath).href,
    pathToFileURL(input.workerRun.stderrPath).href,
    ...(input.workerRun.finalOutputRef === undefined ||
    input.workerRun.finalOutputRef === null
      ? []
      : [input.workerRun.finalOutputRef]),
    ...(input.workerRun.terminalTranscriptRef === undefined ||
    input.workerRun.terminalTranscriptRef === null
      ? []
      : [input.workerRun.terminalTranscriptRef]),
    pathToFileURL(join(input.manifest.archiveRoot, "worker_process_started.json")).href,
    pathToFileURL(join(input.manifest.archiveRoot, "worker_process_events.jsonl")).href,
    ...(input.workerRun.traceResultRef === undefined
      ? []
      : [input.workerRun.traceResultRef]),
    pathToFileURL(join(input.manifest.archiveRoot, "handoff_manifest.json")).href
  ]);
}

function graphVectorRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
}): string {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError(`missing graph vector ${input.vectorIndex}`);
  }
  return sdlcGraphVectorBoundaryRef(vector);
}

function graphFunctionRefForBasis(input: {
  readonly basis: ExecutionBasis;
}): string {
  return sdlcGraphFunctionBoundaryRef(input.basis.graphFunction);
}

function targetOutcomeRefForBasis(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
}): string {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError(`missing graph vector ${input.vectorIndex}`);
  }
  return sdlcTargetOutcomeRef({
    graphFunctionRef: graphFunctionRefForBasis(input),
    targetNodeRef: vector.target.id
  });
}

function traversalConsequenceEvidenceRefs(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
}): readonly string[] {
  return uniqueSorted([
    ...workerProcessEvidenceRefs({
      manifest: input.state.manifest,
      workerRun: input.state.workerRun
    }),
    ...(input.state.workerReport === null
      ? []
      : [pathToFileURL(input.state.workerReport.outputFile).href]),
    ...(input.state.postflight?.evidenceRefs ?? []),
    ...fpEvaluateResultRefsForState(input.state),
    ...(input.state.gapDossier === null
      ? []
      : [
          input.state.gapDossier.currentGapDossierRef,
          ...input.state.gapDossier.evidenceRefs
        ])
  ]);
}

function fpEvaluateResultRefsForState(
  state: SdlcAbgOwnedFpDispatchState
): readonly string[] {
  if (state.workerReport === null || state.postflight === null) {
    return Object.freeze([]);
  }
  if (!existsSync(state.manifest.fpEvaluateResultFile)) {
    throw new TypeError(
      "fp_evaluate_result.json missing for admitted worker report; ledger predecessor invariant violated"
    );
  }
  return Object.freeze([pathToFileURL(state.manifest.fpEvaluateResultFile).href]);
}

function readFpEvaluateResultForState(
  state: SdlcAbgOwnedFpDispatchState
): Pick<SdlcFpEvaluateResult, "status" | "obligationAssessmentCounts"> | null {
  if (state.workerReport === null || state.postflight === null) {
    return null;
  }
  if (!existsSync(state.manifest.fpEvaluateResultFile)) {
    return null;
  }
  const parsed = jsonRecord(JSON.parse(
    readFileSync(state.manifest.fpEvaluateResultFile, "utf8")
  ));
  if (parsed === null) {
    return null;
  }
  if (
    parsed["kind"] !== "sdlc_fp_evaluate_result" ||
    !isSdlcFpEvaluateResultStatus(parsed["status"]) ||
    !isFpEvaluateObligationAssessmentCounts(parsed["obligationAssessmentCounts"])
  ) {
    return null;
  }
  return Object.freeze({
    status: parsed["status"],
    obligationAssessmentCounts: parsed["obligationAssessmentCounts"]
  });
}

function fpEvaluateOpenObligationPressureRefsForState(
  state: SdlcAbgOwnedFpDispatchState
): readonly string[] {
  const result = readFpEvaluateResultForState(state);
  if (result === null) {
    return Object.freeze([]);
  }
  return sdlcFpEvaluateOpenObligationPressureRefs({
    runRef: manifestRefSegment(state.manifest),
    status: result.status,
    obligationAssessmentCounts: result.obligationAssessmentCounts,
    obligationAssessments:
      state.workerReport?.obligationAssessments ?? Object.freeze([])
  });
}

function reviewGradeResidualPressureRefsForState(
  state: SdlcAbgOwnedFpDispatchState
): readonly string[] {
  if (!reviewGradeEdgeFulfillmentAssessmentRequired(state.manifest)) {
    return Object.freeze([]);
  }
  const runRef = manifestRefSegment(state.manifest);
  const assessmentPath = join(
    state.manifest.archiveRoot,
    REVIEW_GRADE_EDGE_FULFILLMENT_ASSESSMENT_FILE
  );
  if (!existsSync(assessmentPath)) {
    return Object.freeze([
      `pressure://odd-sdlc/review-grade/${runRef}/assessment-missing`
    ]);
  }
  const admission = admitReviewGradeEdgeFulfillmentAssessmentFromArtifact({
    manifest: state.manifest,
    outputFile: assessmentPath
  });
  if (admission.status !== "admitted" || admission.assessment === null) {
    return uniqueSorted(
      admission.blockingReasons.map(
        (reason) =>
          `pressure://odd-sdlc/review-grade/${runRef}/${encodeURIComponent(reason)}`
      )
    );
  }
  return reviewGradeEdgeFulfillmentAssessmentPressureRefs({
    runRef,
    targetAssetType: state.manifest.targetAssetType,
    assessment: admission.assessment
  });
}

function lawfulReentryPointForRepairSurfaceTriage(
  triage: SdlcRepairSurfaceTriageCarrier
): SdlcBlockingReasonLawfulReentryPoint {
  switch (triage.disposition) {
    case "current_edge_repair":
      return "same_edge_retry";
    case "upstream_reentry":
      return "escalate_to_fp";
    case "downstream_deferred":
      return "triage_gap";
    case "external_blocked":
      return "operator_blocked";
  }
}

function messageForRepairSurfaceTriage(
  triage: SdlcRepairSurfaceTriageCarrier
): string {
  switch (triage.disposition) {
    case "current_edge_repair":
      return "Review-grade residual pressure remains current-edge repair.";
    case "upstream_reentry":
      return "Review-grade residual pressure names an upstream repair surface.";
    case "downstream_deferred":
      return "Review-grade residual pressure is deferred to a downstream stage.";
    case "external_blocked":
      return "Review-grade residual pressure is externally blocked.";
  }
}

function reviewGradeResidualPressureCarriersForState(
  state: SdlcAbgOwnedFpDispatchState
): readonly ReturnType<typeof makeSdlcClosureResidualPressureCarrier>[] {
  if (!reviewGradeEdgeFulfillmentAssessmentRequired(state.manifest)) {
    return Object.freeze([]);
  }
  const runRef = manifestRefSegment(state.manifest);
  const assessmentPath = join(
    state.manifest.archiveRoot,
    REVIEW_GRADE_EDGE_FULFILLMENT_ASSESSMENT_FILE
  );
  if (!existsSync(assessmentPath)) {
    return closureResidualPressureCarriersForRefs({
      refs: [`pressure://odd-sdlc/review-grade/${runRef}/assessment-missing`],
      lawfulReentryPoint: "triage_gap",
      message: "Review-grade assessment is missing and requires triage."
    });
  }
  const admission = admitReviewGradeEdgeFulfillmentAssessmentFromArtifact({
    manifest: state.manifest,
    outputFile: assessmentPath
  });
  if (admission.status !== "admitted" || admission.assessment === null) {
    return closureResidualPressureCarriersForRefs({
      refs: admission.blockingReasons.map(
        (reason) =>
          `pressure://odd-sdlc/review-grade/${runRef}/${encodeURIComponent(reason)}`
      ),
      lawfulReentryPoint: "triage_gap",
      message: "Review-grade assessment could not be admitted and requires triage."
    });
  }
  return reviewGradeEdgeFulfillmentRepairSurfaceTriageRows({
    runRef,
    targetAssetType: state.manifest.targetAssetType,
    assessment: admission.assessment
  })
    .filter((row) => row.triage.disposition !== "downstream_deferred")
    .map((row) =>
      makeSdlcClosureResidualPressureCarrier({
        pressureRef: row.pressureRef,
        lawfulReentryPoint: lawfulReentryPointForRepairSurfaceTriage(row.triage),
        message: messageForRepairSurfaceTriage(row.triage),
        detail: [
          `review_grade_obligation=${row.obligationId}`,
          `repairSurfaceDisposition=${row.triage.disposition}`,
          `repairGraphFunctionRef=${row.triage.repairGraphFunctionRef ?? "none"}`,
          `repairGraphVectorRef=${row.triage.repairGraphVectorRef ?? "none"}`,
          `repairAssetRef=${row.triage.repairAssetRef ?? "none"}`,
          `rationale=${row.triage.rationale}`
        ].join(";"),
        evidenceRefs: uniqueSorted([
          row.pressureRef,
          ...row.triage.evidenceRefs,
          ...admission.evidenceRefs
        ]),
        repairSurfaceTriage: row.triage
      })
    );
}

function fpEvaluationCloseDispositionForState(
  state: SdlcAbgOwnedFpDispatchState
): FpEvaluationCloseDisposition {
  if (reviewGradeResidualPressureRefsForState(state).length > 0) {
    return "no_close";
  }
  if (componentDepthResidualPressureRefsForState(state).length > 0) {
    return "no_close";
  }
  if (fpEvaluateOpenObligationPressureRefsForState(state).length > 0) {
    return "no_close";
  }
  if (state.status === "worker_invoked" && state.blockingReason === null) {
    return "close";
  }
  if (state.status === "fp_escalation") {
    return "human_required";
  }
  return "no_close";
}

function componentDepthResidualPressureRefsForState(
  state: SdlcAbgOwnedFpDispatchState
): readonly string[] {
  if (
    sdlcInstalledOperatorProjectsOutput(state.manifest.targetAssetType) &&
    !existsSync(
      join(state.manifest.archiveRoot, "declared_edge_projection_artifact.json")
    )
  ) {
    return Object.freeze([]);
  }
  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: state.manifest.targetAssetType,
    outputFile: state.manifest.outputFile
  });
  return componentDepthResidualPressureRefs({
    runRef: manifestRefSegment(state.manifest),
    admission
  });
}

function fpEvaluationResidualPressureRefsForState(
  state: SdlcAbgOwnedFpDispatchState
): readonly string[] {
  const runRef = manifestRefSegment(state.manifest);
  return uniqueSorted([
    ...(state.postflight === null
      ? state.blockingReasonCarriers
      : activePostflightBlockingReasonCarriers(state.postflight)
    ).map(
      (reason) =>
        `pressure://odd-sdlc/fp-evaluate/${runRef}/${encodeURIComponent(reason.code)}`
    ),
    ...reviewGradeResidualPressureRefsForState(state),
    ...componentDepthResidualPressureRefsForState(state),
    ...fpEvaluateOpenObligationPressureRefsForState(state)
  ]);
}

function fpEvaluationOutcomeForDispatchState(input: {
  readonly pluginInput: EnginePluginInput;
  readonly state: SdlcAbgOwnedFpDispatchState;
}): FpEvaluationOutcome {
  const runRef = manifestRefSegment(input.state.manifest);
  const closeDisposition = fpEvaluationCloseDispositionForState(input.state);
  const residualPressureRefs =
    fpEvaluationResidualPressureRefsForState(input.state);
  const fpEvaluateResultRefs = fpEvaluateResultRefsForState(input.state);
  const evidenceRefs = uniqueSorted([
    input.pluginInput.sourceProjectionRef,
    ...fpEvaluateResultRefs
  ]);
  const authorityRefs = uniqueSorted([
    ...input.pluginInput.expectedAssessmentIds,
    input.pluginInput.selectedRegimeBindingRef ??
      input.pluginInput.selectedCompositionRef,
    ...(input.state.manifest.edgeAssuranceContractRef === undefined
      ? []
      : [input.state.manifest.edgeAssuranceContractRef]),
    ...(input.state.manifest.targetCarrierContractRef === undefined
      ? []
      : [input.state.manifest.targetCarrierContractRef])
  ]);
  return constructFpEvaluationOutcome({
    status: "evaluated",
    ambiguityStatus: closeDisposition === "close" ? "fulfilled" : "partial",
    findings: [
      constructFpEvaluationFinding({
        findingRef: `finding://odd-sdlc/${runRef}/evaluate/fp`,
        evaluatorRef: input.pluginInput.contract.ref,
        gainReportRef: `gain://odd-sdlc/${runRef}/evaluate/fp`,
        metricRefs: [`metric://odd-sdlc/${runRef}/evaluate/fp/obligations`],
        closeDisposition,
        residualPressureRefs,
        continuationRefs: Object.freeze([]),
        evidenceRefs,
        authorityRefs,
        compositionContributionRef:
          input.pluginInput.selectedRegimeBindingRef ??
          input.pluginInput.selectedCompositionRef,
        compositionRef: input.pluginInput.selectedCompositionRef,
        compositionDigest: input.pluginInput.selectedCompositionDigest,
        diagnosticRefs: uniqueSorted([
          ...residualPressureRefs,
          ...input.pluginInput.stageSetDependencyRefs,
          ...traversalConsequenceEvidenceRefs({ state: input.state })
        ])
      })
    ],
    evidenceRefs,
    diagnosticRefs: residualPressureRefs
  });
}

async function runSdlcPostTransformDiagnosticFlow(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly basis: ExecutionBasis;
  readonly edgeAccountingRow: SdlcExecutiveEdgeAccountingRow | null;
  readonly eventSink: (event: RuntimeEvent) => void;
  readonly postflightRelativePath: string;
  readonly writeMaterializationManifest: boolean;
  readonly fpEvaluatorAdmissionEvidenceRefs?: readonly string[] | undefined;
}): Promise<{
  readonly postflight: SdlcPostflightResult;
  readonly assuranceGate: SdlcOperatorAssuranceGateResult;
}> {
  if (input.state.workerReport === null) {
    throw new TypeError("post-transform diagnostic flow requires a worker report");
  }
  if (input.writeMaterializationManifest) {
    writeProductMaterializationManifest({
      manifest: input.state.manifest,
      report: input.state.workerReport
    });
  }
  if (input.state.manifest.edgeName === "derive_component_code_surface") {
    await writeLiveFpParallelMaterializationFrontier({
      basis: input.basis,
      manifest: input.state.manifest,
      carriers: deriveSdlcStagedConstructionAuditCarriers(
        input.state.manifest,
        input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([])
      ),
      eventSink: input.eventSink
    });
  }
  const postflight = evaluateSdlcComputeStage({
    manifest: input.state.manifest,
    report: input.state.workerReport,
    fpEvaluatorAdmissionEvidenceRefs:
      input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([])
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.state.manifest.archiveRoot,
    relativePath: input.postflightRelativePath,
    payload: postflight
  });
  writeSdlcFpEvaluateResult({
    manifest: input.state.manifest,
    selectedComposition: input.state.selectedComposition,
    report: input.state.workerReport,
    postflight,
    postflightRef: pathToFileURL(
      join(input.state.manifest.archiveRoot, input.postflightRelativePath)
    ).href
  });
  await writeTraversalSelectionAudit({
    basis: input.basis,
    manifest: input.state.manifest,
    postflight,
    edgeAccountingRow: input.edgeAccountingRow,
    eventSink: input.eventSink,
    fpEvaluatorAdmissionEvidenceRefs:
      input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([])
  });
  const assuranceGate = deriveSdlcOperatorAssuranceGate({
    manifest: input.state.manifest,
    report: input.state.workerReport,
    postflight
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.state.manifest.archiveRoot,
    relativePath: "assurance_satisfaction.json",
    payload: assuranceGate.satisfaction
  });
  return Object.freeze({
    postflight,
    assuranceGate
  });
}

async function refreshDesignDepthStateFromFpEvaluatorRegister(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly basis: ExecutionBasis;
  readonly edgeAccountingRow: SdlcExecutiveEdgeAccountingRow | null;
  readonly eventSink: (event: RuntimeEvent) => void;
  readonly fpEvaluatorAdmissionEvidenceRefs: readonly string[];
}): Promise<SdlcAbgOwnedFpDispatchState> {
  if (
    input.state.manifest.targetAssetType !== "implementation_design_surface" ||
    input.state.workerReport === null
  ) {
    return input.state;
  }
  const admission = admitImplementationDesignRegisterForRuntimeEvaluation({
    manifest: input.state.manifest,
    fpEvaluatorAdmissionEvidenceRefs: input.fpEvaluatorAdmissionEvidenceRefs
  });
  if (admission.status !== "admitted" || admission.register === null) {
    return input.state;
  }
  const diagnostics = await runSdlcPostTransformDiagnosticFlow({
    state: input.state,
    basis: input.basis,
    edgeAccountingRow: input.edgeAccountingRow,
    eventSink: input.eventSink,
    postflightRelativePath: "fp_evaluator_postflight.json",
    writeMaterializationManifest: false,
    fpEvaluatorAdmissionEvidenceRefs: input.fpEvaluatorAdmissionEvidenceRefs
  });
  return Object.freeze({
    ...input.state,
    status: "worker_invoked" as const,
    postflight: diagnostics.postflight,
    assuranceSatisfaction: diagnostics.assuranceGate.satisfaction,
    gapDossier: null,
    blockingReason: null,
    blockingReasonCarriers: Object.freeze([])
  });
}

function shouldDeferDispatchConsequenceToFpEvaluator(
  state: SdlcAbgOwnedFpDispatchState
): boolean {
  return (
    sdlcInstalledOperatorProjectsOutput(state.manifest.targetAssetType) ||
    ((state.manifest.targetAssetType === "implementation_design_surface" ||
      reviewGradeEdgeFulfillmentAssessmentRequired(state.manifest)) &&
      state.workerReport !== null)
  );
}

function manifestRefSegment(manifest: SdlcWorkerHandoffManifest): string {
  return encodeURIComponent(pathToFileURL(manifest.archiveRoot).href);
}

function materializedFileRef(file: {
  readonly absolutePath: string;
}): string {
  return pathToFileURL(file.absolutePath).href;
}

function workerOutputMaterializationRefs(
  state: SdlcAbgOwnedFpDispatchState
): readonly string[] {
  const report = state.workerReport;
  if (report === null) {
    return Object.freeze([]);
  }
  return uniqueSorted([
    pathToFileURL(report.outputFile).href,
    ...report.materializedFiles.map(materializedFileRef)
  ]);
}

export type SdlcPublishedProductMaterializationActionStatus =
  | "eligible"
  | "unpublished"
  | "no_output_asset"
  | "target_binding_mismatch";

export interface SdlcPublishedProductMaterializationAction {
  readonly kind: "sdlc_published_product_materialization_action";
  readonly status: SdlcPublishedProductMaterializationActionStatus;
  readonly graphFunctionName: typeof FG_MATERIALIZE_DECLARED_PRODUCT_ASSET;
  readonly graphFunctionRef: string | null;
  readonly publishedActionRef: string | null;
  readonly outputAssetTypes: readonly string[];
  readonly targetBindingRefs: readonly string[];
  readonly eligibleTargetBindingRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}

function targetBindingRefForAssetType(assetType: string): string {
  return `target-binding://odd-sdlc/${assetType}`;
}

function assetTypeRefFor(assetType: string): string {
  return `asset-type://odd-sdlc/${assetType}`;
}

function materializationTargetAssetTypeFromActionRef(ref: string): string | null {
  const marker = [
    "target-outcome://odd-sdlc/post-action",
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    ""
  ].join("/");
  const markerIndex = ref.indexOf(marker);
  if (markerIndex < 0) {
    return null;
  }
  const suffix = ref.slice(markerIndex + marker.length);
  const encodedAssetType = suffix.split("/")[0] ?? "";
  if (encodedAssetType.length === 0) {
    return null;
  }
  try {
    const assetType = decodeURIComponent(encodedAssetType);
    return assetType.length === 0 ? null : assetType;
  } catch {
    return encodedAssetType;
  }
}

interface SdlcGraphTrackActionTarget {
  readonly requestedTargetAssetType: string;
  readonly graphFunctionName: string;
  readonly graphFunctionRef: string;
  readonly graphVectorName: string;
  readonly graphVectorRef: string;
  readonly targetAssetType: string;
  readonly targetNodeRef: string;
  readonly publishedTraversalTargetRef: string;
  readonly targetOutcomeRef: string;
}

type SdlcGraphTrackActionTargetResolution =
  | {
      readonly status: "selected";
      readonly target: SdlcGraphTrackActionTarget;
    }
  | {
      readonly status: "unresolved" | "ambiguous";
      readonly reasonRef: string;
    };

interface SdlcGraphTrackCandidate {
  readonly graphFunction: Module["graphFunctions"][number];
  readonly vector: ReturnType<typeof materializeGraphFunction>["vectors"][number];
  readonly inputAssetTypes: readonly string[];
  readonly targetAssetType: string;
}

export type SdlcPostProductMaterializationActionResolution =
  | {
      readonly status: "selected";
      readonly action: OddSdlcEvaluateNextActionInput;
    }
  | {
      readonly status: "no_pressure";
    }
  | {
      readonly status: "no_candidate_matched";
      readonly reasonRefs: readonly string[];
    }
  | {
      readonly status: "blocked";
      readonly blockingReason: SdlcBlockingReason;
    };

function targetAssetTypeFromBindingRef(ref: string): string | null {
  const prefix = "target-binding://odd-sdlc/";
  if (!ref.startsWith(prefix)) {
    return null;
  }
  const assetType = ref.slice(prefix.length);
  return assetType.length === 0 ? null : assetType;
}

function targetAssetTypeFromAuthorityRef(ref: string): string | null {
  const scopedPrefix = "asset-type://odd-sdlc/";
  if (ref.startsWith(scopedPrefix)) {
    const assetType = ref.slice(scopedPrefix.length);
    return assetType.length === 0 ? null : assetType;
  }
  const prefix = "asset-type://";
  if (ref.startsWith(prefix)) {
    const assetType = ref.slice(prefix.length);
    return assetType.length === 0 ? null : assetType;
  }
  return null;
}

function admittedAssetTypesFromEvents(
  events: readonly RuntimeEvent[]
): readonly string[] {
  return uniqueSorted(
    events.flatMap((event) => {
      if (event.kind !== "evidence_admitted") {
        return [];
      }
      const authorityRef =
        typeof event.authorityRef === "string" ? event.authorityRef : null;
      if (authorityRef === null) {
        return [];
      }
      const assetType = targetAssetTypeFromAuthorityRef(authorityRef);
      return assetType === null ? [] : [assetType];
    })
  );
}

function admittedAssetTypesForState(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly emittedEvents: readonly RuntimeEvent[];
}): readonly string[] {
  const currentEdgeAdmitted =
    input.state.status === "worker_invoked" &&
    input.state.postflight?.status === "passed";
  return uniqueSorted([
    ...admittedAssetTypesFromEvents(input.replayEvents),
    ...admittedAssetTypesFromEvents(input.emittedEvents),
    ...(currentEdgeAdmitted
      ? [
          ...input.state.manifest.inputAssetTypes,
          input.state.manifest.targetAssetType
        ]
      : [])
  ]);
}

function inheritedMaterializationPressure(input: {
  readonly selectedActionRef: string | null;
  readonly basisRefs: readonly string[];
  readonly admittedAssetTypes: readonly string[];
}): {
  readonly downstreamPressureRefs: readonly string[];
  readonly downstreamTargetBindingRefs: readonly string[];
} {
  const emptyPressure = Object.freeze({
    downstreamPressureRefs: Object.freeze([]),
    downstreamTargetBindingRefs: Object.freeze([])
  });
  if (
    input.selectedActionRef === null ||
    !input.selectedActionRef.includes(FG_MATERIALIZE_DECLARED_PRODUCT_ASSET)
  ) {
    return emptyPressure;
  }
  const targetAssetType = materializationTargetAssetTypeFromActionRef(
    input.selectedActionRef
  );
  if (
    targetAssetType !== null &&
    new Set(input.admittedAssetTypes).has(targetAssetType)
  ) {
    return emptyPressure;
  }
  return Object.freeze({
    downstreamPressureRefs: uniqueSorted([
      input.selectedActionRef,
      ...input.basisRefs.filter(
        (ref: string) =>
          ref.includes("/downstream_transformation_set") ||
          ref.startsWith("downstream-pressure://") ||
          ref.startsWith("downstream-transformation-set://") ||
          ref.startsWith("requirement-authority://")
      )
    ]),
    downstreamTargetBindingRefs: uniqueSorted([
      ...(targetAssetType === null
        ? []
        : [targetBindingRefForAssetType(targetAssetType)]),
      ...input.basisRefs.filter((ref: string) =>
        ref.startsWith("target-binding://odd-sdlc/")
      )
    ])
  });
}

function graphTrackCandidatesForTarget(input: {
  readonly module: Module;
  readonly targetAssetType: string;
}): readonly SdlcGraphTrackCandidate[] {
  return Object.freeze(
    input.module.graphFunctions.flatMap((graphFunction) => {
      if (
        graphFunction.name.startsWith("Fg_") ||
        graphFunction.tags.includes("executive") ||
        graphFunction.tags.includes("overlay_only_leaf")
      ) {
        return [];
      }
      const graph = materializeGraphFunction(graphFunction);
      return graph.vectors
        .filter((vector) => vector.target.name === input.targetAssetType)
        .map((vector) =>
          Object.freeze({
            graphFunction,
            vector,
            inputAssetTypes: Object.freeze(
              vector.source.map((source) => source.name)
            ),
            targetAssetType: vector.target.name
          })
        );
    })
  );
}

function selectedGraphTrackCandidateTarget(input: {
  readonly candidate: SdlcGraphTrackCandidate;
  readonly requestedTargetAssetType: string;
}): SdlcGraphTrackActionTarget {
  const graphFunctionRef = sdlcGraphFunctionBoundaryRef(input.candidate.graphFunction);
  const graphVectorRef = sdlcGraphVectorBoundaryRef(input.candidate.vector);
  const publishedTraversalTargetRef = sdlcPublishedTraversalTargetRef({
    graphFunctionRef,
    graphVectorRef
  });
  return Object.freeze({
    requestedTargetAssetType: input.requestedTargetAssetType,
    graphFunctionName: input.candidate.graphFunction.name,
    graphFunctionRef,
    graphVectorName: input.candidate.vector.name,
    graphVectorRef,
    targetAssetType: input.candidate.targetAssetType,
    targetNodeRef: input.candidate.vector.target.id,
    publishedTraversalTargetRef,
    targetOutcomeRef: sdlcTargetOutcomeRef({
      graphFunctionRef,
      targetNodeRef: input.candidate.vector.target.id
    })
  });
}

function uniqueGraphTrackProducerForAsset(input: {
  readonly module: Module;
  readonly targetAssetType: string;
}): SdlcGraphTrackActionTargetResolution | {
  readonly status: "producer";
  readonly candidate: SdlcGraphTrackCandidate;
} {
  const candidates = graphTrackCandidatesForTarget({
    module: input.module,
    targetAssetType: input.targetAssetType
  });
  if (candidates.length > 1) {
    return Object.freeze({
      status: "ambiguous" as const,
      reasonRef: `graph_track_target_ambiguous_for_product_materialization_action:${input.targetAssetType}`
    });
  }
  const selected =
    candidates.length === 1 &&
    candidates[0]?.graphFunction.tags.includes("published_leaf")
      ? candidates[0]
      : null;
  if (selected !== null) {
    return Object.freeze({
      status: "producer" as const,
      candidate: selected
    });
  }
  if (candidates.length === 1) {
    return Object.freeze({
      status: "unresolved" as const,
      reasonRef: `graph_track_target_unpublished_for_product_materialization_action:${input.targetAssetType}`
    });
  }
  return Object.freeze({
    status: "unresolved" as const,
    reasonRef: `graph_track_target_unresolved_for_product_materialization_action:${input.targetAssetType}`
  });
}

function nextMissingGraphTrackTargetForAsset(input: {
  readonly module: Module;
  readonly requestedTargetAssetType: string;
  readonly targetAssetType: string;
  readonly admittedAssetTypes: ReadonlySet<string>;
  readonly visitedAssetTypes: ReadonlySet<string>;
}): SdlcGraphTrackActionTargetResolution {
  if (input.admittedAssetTypes.has(input.targetAssetType)) {
    return Object.freeze({
      status: "unresolved" as const,
      reasonRef: `graph_track_target_already_admitted_for_product_materialization_action:${input.targetAssetType}`
    });
  }
  if (input.visitedAssetTypes.has(input.targetAssetType)) {
    return Object.freeze({
      status: "unresolved" as const,
      reasonRef: `graph_track_target_cycle_for_product_materialization_action:${input.targetAssetType}`
    });
  }
  const producer = uniqueGraphTrackProducerForAsset({
    module: input.module,
    targetAssetType: input.targetAssetType
  });
  if (producer.status !== "producer") {
    return producer;
  }
  const visitedAssetTypes = new Set(input.visitedAssetTypes);
  visitedAssetTypes.add(input.targetAssetType);
  for (const sourceAssetType of producer.candidate.inputAssetTypes) {
    if (input.admittedAssetTypes.has(sourceAssetType)) {
      continue;
    }
    const upstream = nextMissingGraphTrackTargetForAsset({
      module: input.module,
      requestedTargetAssetType: input.requestedTargetAssetType,
      targetAssetType: sourceAssetType,
      admittedAssetTypes: input.admittedAssetTypes,
      visitedAssetTypes
    });
    if (upstream.status === "selected" || upstream.status === "ambiguous") {
      return upstream;
    }
    if (!upstream.reasonRef.includes("_already_admitted_")) {
      return upstream;
    }
  }
  return Object.freeze({
    status: "selected" as const,
    target: selectedGraphTrackCandidateTarget({
      candidate: producer.candidate,
      requestedTargetAssetType: input.requestedTargetAssetType
    })
  });
}

function graphTrackActionTargetFor(input: {
  readonly module: Module;
  readonly downstreamTargetBindingRefs: readonly string[];
  readonly admittedAssetTypes: readonly string[];
}): SdlcGraphTrackActionTargetResolution {
  const targetAssetTypes = uniqueSorted(
    input.downstreamTargetBindingRefs.flatMap((ref) => {
      const assetType = targetAssetTypeFromBindingRef(ref);
      return assetType === null ? [] : [assetType];
    })
  );
  if (targetAssetTypes.length === 0) {
    return Object.freeze({
      status: "unresolved" as const,
      reasonRef: "graph_track_target_unresolved_for_product_materialization_action"
    });
  }
  const admittedAssetTypes = new Set(uniqueSorted(input.admittedAssetTypes));
  const unresolvedReasonRefs: string[] = [];
  for (const targetAssetType of targetAssetTypes) {
    const resolution = nextMissingGraphTrackTargetForAsset({
      module: input.module,
      requestedTargetAssetType: targetAssetType,
      targetAssetType,
      admittedAssetTypes,
      visitedAssetTypes: new Set()
    });
    if (resolution.status === "selected" || resolution.status === "ambiguous") {
      return resolution;
    }
    unresolvedReasonRefs.push(resolution.reasonRef);
  }
  return Object.freeze({
    status: "unresolved" as const,
    reasonRef: uniqueSorted(unresolvedReasonRefs).join(",")
  });
}

export function deriveSdlcPublishedProductMaterializationAction(input: {
  readonly module: Module;
  readonly downstreamTargetBindingRefs?: readonly string[];
}): SdlcPublishedProductMaterializationAction {
  const graphFunction = input.module.graphFunctions.find(
    (candidate) => candidate.name === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  );
  const requiredTargetBindingRefs = uniqueSorted(
    input.downstreamTargetBindingRefs ?? []
  );
  if (graphFunction === undefined) {
    return Object.freeze({
      kind: "sdlc_published_product_materialization_action" as const,
      status: "unpublished" as const,
      graphFunctionName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
      graphFunctionRef: null,
      publishedActionRef: null,
      outputAssetTypes: Object.freeze([]),
      targetBindingRefs: Object.freeze([]),
      eligibleTargetBindingRefs: Object.freeze([]),
      reasonRefs: Object.freeze([
        "product_materialization_graph_function_unpublished"
      ])
    });
  }
  const outputAssetTypes = uniqueSorted(
    graphFunction.outputs.map((output) => output.name)
  );
  const targetBindingRefs = uniqueSorted(
    outputAssetTypes.map(targetBindingRefForAssetType)
  );
  const eligibleTargetBindingRefs =
    requiredTargetBindingRefs.length === 0
      ? targetBindingRefs
      : targetBindingRefs.filter((ref) => requiredTargetBindingRefs.includes(ref));
  const graphFunctionRef = sdlcGraphFunctionBoundaryRef(graphFunction);
  const publishedActionRef = sdlcPublishedActionRef({ graphFunctionRef });
  if (outputAssetTypes.length === 0) {
    return Object.freeze({
      kind: "sdlc_published_product_materialization_action" as const,
      status: "no_output_asset" as const,
      graphFunctionName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
      graphFunctionRef,
      publishedActionRef,
      outputAssetTypes,
      targetBindingRefs,
      eligibleTargetBindingRefs: Object.freeze([]),
      reasonRefs: Object.freeze([
        "product_materialization_graph_function_has_no_output_asset"
      ])
    });
  }
  if (
    requiredTargetBindingRefs.length > 0 &&
    eligibleTargetBindingRefs.length === 0
  ) {
    return Object.freeze({
      kind: "sdlc_published_product_materialization_action" as const,
      status: "target_binding_mismatch" as const,
      graphFunctionName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
      graphFunctionRef,
      publishedActionRef,
      outputAssetTypes,
      targetBindingRefs,
      eligibleTargetBindingRefs: Object.freeze([]),
      reasonRefs: uniqueSorted([
        "downstream_target_binding_not_admitted_for_published_materializer",
        ...requiredTargetBindingRefs.map((ref) => `required_target_binding:${ref}`),
        ...targetBindingRefs.map((ref) => `published_target_binding:${ref}`)
      ])
    });
  }
  return Object.freeze({
    kind: "sdlc_published_product_materialization_action" as const,
    status: "eligible" as const,
    graphFunctionName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    graphFunctionRef,
    publishedActionRef,
    outputAssetTypes,
    targetBindingRefs,
    eligibleTargetBindingRefs,
    reasonRefs: uniqueSorted([
      "evaluate_next_declared_product_materialization_action_published",
      ...eligibleTargetBindingRefs.map((ref) => `eligible_target_binding:${ref}`)
    ])
  });
}

export function sdlcAssessmentCarriesRequirementForDownstreamClosure(
  assessment: SdlcWorkerObligationAssessment
): boolean {
  return (
    assessment.obligationId.startsWith("requirement:") &&
    assessment.blockingReasons.some((reason) =>
      reason.startsWith("requirement_carried_for_downstream_closure:")
    )
  );
}

export function sdlcRequirementObligationBelongsToDownstreamComponentSurface(input: {
  readonly targetAssetType: string;
  readonly productMaterializationRequired: boolean;
  readonly obligationKind: string;
  readonly sourceRefs: readonly string[];
  readonly sourceSnippets: readonly string[];
}): boolean {
  if (
    input.targetAssetType !== "component_code_surface" ||
    !input.productMaterializationRequired ||
    input.obligationKind !== "requirement"
  ) {
    return false;
  }
  const refNamesDownstream = input.sourceRefs.some((ref) => {
    const lower = ref.toLowerCase();
    return (
      lower.includes("adr-003-test-design-surface.md") ||
      lower.includes("/component_test_surface.md") ||
      lower.includes("/component_test_") ||
      lower.includes("test-design-surface") ||
      lower.includes("/test/") ||
      lower.includes(".test.")
    );
  });
  const sourceText = input.sourceSnippets.join("\n").toLowerCase();
  return (
    refNamesDownstream ||
    sourceText.includes("execution proof") ||
    sourceText.includes("execution evidence") ||
    sourceText.includes("test execution") ||
    sourceText.includes("test command") ||
    sourceText.includes("branch test") ||
    sourceText.includes("proof-test") ||
    sourceText.includes("testcase") ||
    sourceText.includes("test case") ||
    sourceText.includes("/test/") ||
    sourceText.includes(".test.") ||
    sourceText.includes("`test`")
  );
}

function manifestRequirementObligationBelongsToDownstreamSurface(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly obligation: SdlcTraversalObligation;
}): boolean {
  return sdlcRequirementObligationBelongsToDownstreamComponentSurface({
    targetAssetType: input.manifest.targetAssetType,
    productMaterializationRequired: input.manifest.productMaterialization.required,
    obligationKind: input.obligation.obligationKind,
    sourceRefs: input.obligation.payload.sourceRefs,
    sourceSnippets: input.obligation.payload.sourceSnippets
  });
}

function manifestAssessmentObligationBelongsToDownstreamSurface(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly assessment: SdlcWorkerObligationAssessment;
}): boolean {
  const obligation =
    input.manifest.traversalObligationContext.obligations.find(
      (candidate) => candidate.obligationId === input.assessment.obligationId
    ) ?? null;
  return obligation === null
    ? false
    : manifestRequirementObligationBelongsToDownstreamSurface({
        manifest: input.manifest,
        obligation
      });
}

export function sdlcWorkerAssessmentCarriesRequirementTransformationSet(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly assessment: SdlcWorkerObligationAssessment;
}): boolean {
  if (!input.assessment.obligationId.startsWith("requirement:")) {
    return false;
  }
  const authorityRequirementInduction =
    input.manifest.graphFunctionName === FG_CONFORM_PROJECT_AUTHORITY &&
    !input.manifest.productMaterialization.required;
  const belongsToDownstreamSurface =
    manifestAssessmentObligationBelongsToDownstreamSurface(input);
  const carriesDownstreamRequirement =
    sdlcAssessmentCarriesRequirementForDownstreamClosure(input.assessment) ||
    (input.manifest.productMaterialization.required
      ? belongsToDownstreamSurface
      : false);
  return (
    carriesDownstreamRequirement ||
    (!input.manifest.productMaterialization.required &&
      (authorityRequirementInduction ||
        (input.manifest.targetAssetType === "requirement_surface" &&
          input.assessment.blockingReasons.some((reason) =>
            reason.startsWith("requirement_recorded_for_future_closure:")
          ))))
  );
}

function edgeFulfillmentProjectionFor(input: {
  readonly module: Module;
  readonly state: SdlcAbgOwnedFpDispatchState;
}): SdlcEdgeFulfillmentCountProjection {
  const materializationAction = deriveSdlcPublishedProductMaterializationAction({
    module: input.module
  });
  const assessments = Object.freeze(
    (input.state.workerReport?.obligationAssessments ?? Object.freeze([])).map(
      (assessment) => {
        const carriesRequirementTransformationSet =
          sdlcWorkerAssessmentCarriesRequirementTransformationSet({
            manifest: input.state.manifest,
            assessment
          });
        return Object.freeze({
          obligationId: assessment.obligationId,
          fulfillmentStatus: assessment.fulfillmentStatus,
          evidenceRefs: assessment.evidenceRefs,
          ...(carriesRequirementTransformationSet
            ? {
                carryDirection: "downstream_transformation_set" as const,
                downstreamGraphFunctionRefs:
                  materializationAction.graphFunctionRef === null
                    ? Object.freeze([])
                    : Object.freeze([materializationAction.graphFunctionRef]),
                targetBindingRefs: materializationAction.targetBindingRefs
              }
            : {})
        });
      }
    )
  );
  return deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: uniqueSorted([
      ...input.state.manifest.traversalObligationContext.obligations.map(
        (obligation) => obligation.obligationId
      ),
      ...(input.state.manifest.graphFunctionName === FG_CONFORM_PROJECT_AUTHORITY
        ? assessments
            .map((assessment) => assessment.obligationId)
            .filter((obligationId) => obligationId.startsWith("requirement:"))
        : [])
    ]),
    assessments
  });
}

function structuralBlockReasonRefsForState(
  state: SdlcAbgOwnedFpDispatchState
): readonly string[] {
  if (state.status === "worker_invoked" || state.blockingReasonCarriers.length > 0) {
    return Object.freeze([]);
  }
  return uniqueSorted([
    ...(state.gapDossier === null ? [] : [state.gapDossier.currentGapDossierRef]),
    ...state.blockingReasonCarriers.flatMap((reason) => reason.evidenceRefs)
  ]);
}

export function deriveSdlcProductLineageYieldResumeBasis(input: {
  readonly runRef: string;
  readonly edgeRef: string;
  readonly blockingReasonCarriers: readonly SdlcBlockingReason[];
  readonly productEvidenceRefs: readonly string[];
  readonly livenessProjectionRefs: readonly string[];
}): Omit<SdlcYieldResumeBasis, "kind"> | null {
  const lineageReasons = input.blockingReasonCarriers.filter(
    (reason) => reason.code === "materialized_product_requirement_lineage_missing"
  );
  if (lineageReasons.length === 0) {
    return null;
  }
  const competingSameEdgeReasons = input.blockingReasonCarriers.filter(
    (reason) =>
      reason.lawfulReentryPoint === "same_edge_retry" &&
      reason.code !== "materialized_product_requirement_lineage_missing"
  );
  if (competingSameEdgeReasons.length > 0) {
    return null;
  }
  if (input.productEvidenceRefs.length === 0) {
    return null;
  }
  return Object.freeze({
    yieldKind: "partial_product_evidence_admitted_current_edge_should_resume",
    resumeBasisRef: `resume-basis://odd-sdlc/${input.runRef}/materialized-product-lineage`,
    currentEdgeRef: input.edgeRef,
    admittedProgressRefs: input.productEvidenceRefs,
    livenessProjectionRef: input.livenessProjectionRefs[0] ?? null,
    resumePolicyRef:
      "resume-policy://odd-sdlc/materialized-product-lineage/operator-iterate"
  });
}

function deriveSdlcUpstreamRepairSurfaceYieldResumeBasis(input: {
  readonly runRef: string;
  readonly edgeRef: string;
  readonly residualPressureCarriers: readonly ReturnType<
    typeof makeSdlcClosureResidualPressureCarrier
  >[];
  readonly livenessProjectionRefs: readonly string[];
}): Omit<SdlcYieldResumeBasis, "kind"> | null {
  const upstreamCarrier =
    input.residualPressureCarriers.find(
      (carrier) =>
        carrier.repairSurfaceTriage?.disposition === "upstream_reentry"
    ) ?? null;
  const triage = upstreamCarrier?.repairSurfaceTriage ?? null;
  if (
    upstreamCarrier === null ||
    triage === null ||
    triage.repairGraphFunctionRef === null ||
    triage.repairGraphVectorRef === null ||
    triage.repairAssetRef === null
  ) {
    return null;
  }
  return Object.freeze({
    yieldKind: "nonlocal_repair_surface_admitted_upstream_reentry" as const,
    resumeBasisRef:
      `resume-basis://odd-sdlc/${input.runRef}/upstream-reentry/${encodeURIComponent(triage.repairGraphVectorRef)}`,
    currentEdgeRef: input.edgeRef,
    admittedProgressRefs: uniqueSorted([
      upstreamCarrier.pressureRef,
      triage.repairGraphFunctionRef,
      triage.repairGraphVectorRef,
      triage.repairAssetRef,
      ...upstreamCarrier.evidenceRefs,
      ...triage.evidenceRefs
    ]),
    livenessProjectionRef: input.livenessProjectionRefs[0] ?? null,
    resumePolicyRef:
      "resume-policy://odd-sdlc/nonlocal-repair-surface/upstream-reentry"
  });
}

function postActionCandidateFor(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly basisKind: string;
  readonly actionKind: OddSdlcEvaluateNextActionInput["actionKind"];
  readonly eligibleReasonRefs?: readonly string[];
}) {
  const graphFunctionRef = graphFunctionRefForBasis({ basis: input.basis });
  const vectorRef = graphVectorRef({
    basis: input.basis,
    vectorIndex: input.vectorIndex
  });
  const outcomeRef = targetOutcomeRefForBasis({
    basis: input.basis,
    vectorIndex: input.vectorIndex
  });
  const actionRef = [
    "construction-action://odd-sdlc/post-action",
    graphFunctionRef,
    input.basisKind,
    vectorRef
  ].join("/");
  return Object.freeze({
    actionRef,
    actionKind: input.actionKind,
    graphFunctionRef,
    graphVectorRef: vectorRef,
    publishedTraversalTargetRef: sdlcPublishedTraversalTargetRef({
      graphFunctionRef,
      graphVectorRef: vectorRef
    }),
    targetOutcomeRef: outcomeRef,
    inputAssetRefs: Object.freeze([]),
    expectedOutputAssetRefs: Object.freeze([outcomeRef]),
    requiredAuthorityRefs: Object.freeze([
      sdlcPublishedTraversalTargetRef({ graphFunctionRef, graphVectorRef: vectorRef })
    ]),
    eligibleReasonRefs: uniqueSorted([
      "evaluate_next_post_action_selected_published_graph_action",
      ...(input.eligibleReasonRefs ?? [])
    ])
  });
}

function postRepairGraphFunctionCandidateForPlan(input: {
  readonly plan: ReturnType<typeof componentRepairReentryPlansForGapDossier>[number];
  readonly runRef: string;
}): OddSdlcEvaluateNextActionInput {
  const graphFunctionRef = input.plan.targetEdgeName;
  const graphVectorRef = input.plan.targetEdgeName;
  const publishedTraversalTargetRef = sdlcPublishedTraversalTargetRef({
    graphFunctionRef,
    graphVectorRef
  });
  const targetOutcomeRef = sdlcTargetOutcomeRef({
    graphFunctionRef,
    targetNodeRef: `node:odd_sdlc:${input.plan.targetAssetType}`
  });
  return Object.freeze({
    actionRef: [
      "construction-action://odd-sdlc/post-action",
      graphFunctionRef,
      "post_repair_reentry",
      graphVectorRef,
      encodeURIComponent(input.runRef)
    ].join("/"),
    actionKind: "reenter_graph_span" as const,
    graphFunctionRef,
    graphVectorRef,
    publishedTraversalTargetRef,
    targetOutcomeRef,
    inputAssetRefs: Object.freeze([]),
    expectedOutputAssetRefs: Object.freeze([targetOutcomeRef]),
    requiredAuthorityRefs: Object.freeze([publishedTraversalTargetRef]),
    eligibleReasonRefs: Object.freeze([
      "evaluate_next_post_repair_reentry",
      `repair_plan:${input.plan.planId}`,
      `source_edge:${input.plan.sourceEdgeName}`,
      `target_edge:${input.plan.targetEdgeName}`,
      `failure:${input.plan.failureId}`
    ])
  });
}

export function deriveSdlcPostCloseOverlayContinuationActionInput(input: {
  readonly module: Module;
  readonly overlayRef: string | null;
  readonly completedGraphFunctionRef: string;
  readonly runRef: string;
}): OddSdlcEvaluateNextActionInput | null {
  if (input.overlayRef === null) {
    return null;
  }
  const catalog = constructSdlcTraversalOverlayCatalog({
    module: input.module
  });
  const overlay = resolveSdlcTraversalOverlay({
    catalog,
    overlayRef: input.overlayRef
  });
  if (overlay === null) {
    return null;
  }
  const continuation = sdlcTraversalOverlayNextGraphContinuation({
    module: input.module,
    overlay,
    completedGraphFunctionRef: input.completedGraphFunctionRef
  });
  if (continuation === null) {
    return null;
  }
  const publishedTraversalTargetRef = sdlcPublishedTraversalTargetRef({
    graphFunctionRef: continuation.nextGraphFunctionRef,
    graphVectorRef: continuation.nextGraphVectorRef
  });
  const targetOutcomeRef = sdlcTargetOutcomeRef({
    graphFunctionRef: continuation.nextGraphFunctionRef,
    targetNodeRef: continuation.targetNodeRef
  });
  return Object.freeze({
    actionRef: [
      "construction-action://odd-sdlc/post-action",
      continuation.nextGraphFunctionRef,
      "post_close_overlay_continuation",
      continuation.nextGraphVectorRef,
      encodeURIComponent(input.runRef)
    ].join("/"),
    actionKind: "invoke_graph_function" as const,
    graphFunctionRef: continuation.nextGraphFunctionRef,
    graphVectorRef: continuation.nextGraphVectorRef,
    publishedTraversalTargetRef,
    targetOutcomeRef,
    inputAssetRefs: Object.freeze([]),
    expectedOutputAssetRefs: Object.freeze([targetOutcomeRef]),
    requiredAuthorityRefs: Object.freeze([publishedTraversalTargetRef]),
    eligibleReasonRefs: Object.freeze([
      "evaluate_next_post_close_overlay_continuation",
      `overlay:${continuation.overlayRef}`,
      `terminal_graph:${continuation.terminalGraphFunctionRef}`,
      `completed_graph:${continuation.completedGraphFunctionRef}`,
      `completed_vector:${continuation.completedGraphVectorRef}`,
      `next_graph:${continuation.nextGraphFunctionRef}`,
      `next_vector:${continuation.nextGraphVectorRef}`,
      `sequence_index:${continuation.sequenceIndex}`
    ])
  });
}

export function deriveSdlcPostCloseNextEligibleOverlayActionInput(input: {
  readonly module: Module;
  readonly overlayRef: string | null;
  readonly completedGraphFunctionRef: string;
  readonly runRef: string;
}): OddSdlcEvaluateNextActionInput | null {
  if (input.overlayRef === null) {
    return null;
  }
  const catalog = constructSdlcTraversalOverlayCatalog({
    module: input.module
  });
  const overlay = resolveSdlcTraversalOverlay({
    catalog,
    overlayRef: input.overlayRef
  });
  if (overlay === null || overlay.termination.nextEligibleOverlayRefs.length === 0) {
    return null;
  }
  const graphFunctionByNameLocal = (name: string) =>
    input.module.graphFunctions.find((graphFunction) => graphFunction.name === name);
  let completedTerminalVector:
    | ReturnType<typeof materializeGraphFunction>["vectors"][number]
    | undefined;
  for (const terminalGraphFunctionRef of
    overlay.termination.terminalGraphFunctionRefs) {
    const graphFunction = graphFunctionByNameLocal(terminalGraphFunctionRef);
    if (graphFunction === undefined) {
      continue;
    }
    const vectors = materializeGraphFunction(graphFunction).vectors;
    const terminalVector = vectors[vectors.length - 1];
    if (
      terminalVector !== undefined &&
      (terminalVector.name === input.completedGraphFunctionRef ||
        sdlcGraphVectorBoundaryRef(terminalVector) ===
          input.completedGraphFunctionRef)
    ) {
      completedTerminalVector = terminalVector;
      break;
    }
  }
  if (completedTerminalVector === undefined) {
    return null;
  }
  const nextOverlayRef = overlay.termination.nextEligibleOverlayRefs[0];
  if (nextOverlayRef === undefined) {
    return null;
  }
  const nextOverlay = resolveSdlcTraversalOverlay({
    catalog,
    overlayRef: nextOverlayRef
  });
  if (nextOverlay === null) {
    return null;
  }
  const nextGraphFunction = graphFunctionByNameLocal(nextOverlay.defaultStartTarget);
  if (nextGraphFunction === undefined) {
    return null;
  }
  const nextGraphFunctionRef = sdlcGraphFunctionBoundaryRef(nextGraphFunction);
  const nextGraph = materializeGraphFunction(nextGraphFunction);
  const nextGraphVector = nextGraph.vectors[0];
  if (nextGraphVector === undefined) {
    return null;
  }
  const nextGraphVectorRef = sdlcGraphVectorBoundaryRef(nextGraphVector);
  const publishedTraversalTargetRef = sdlcPublishedTraversalTargetRef({
    graphFunctionRef: nextGraphFunctionRef,
    graphVectorRef: nextGraphVectorRef
  });
  const targetOutcomeRef = sdlcTargetOutcomeRef({
    graphFunctionRef: nextGraphFunctionRef,
    targetNodeRef: nextGraphVector.target.id
  });
  return Object.freeze({
    actionRef: [
      "construction-action://odd-sdlc/post-action",
      nextGraphFunctionRef,
      "post_close_next_eligible_overlay",
      encodeURIComponent(nextOverlay.overlayRef),
      nextGraphVectorRef,
      encodeURIComponent(input.runRef)
    ].join("/"),
    actionKind: "invoke_graph_function" as const,
    graphFunctionRef: nextGraphFunctionRef,
    graphVectorRef: nextGraphVectorRef,
    publishedTraversalTargetRef,
    targetOutcomeRef,
    inputAssetRefs: Object.freeze([]),
    expectedOutputAssetRefs: Object.freeze([targetOutcomeRef]),
    requiredAuthorityRefs: Object.freeze([
      publishedTraversalTargetRef,
      nextOverlay.overlayRef
    ]),
    eligibleReasonRefs: Object.freeze([
      "evaluate_next_post_close_next_eligible_overlay",
      `overlay:${overlay.overlayRef}`,
      `completed_vector:${sdlcGraphVectorBoundaryRef(completedTerminalVector)}`,
      `next_overlay:${nextOverlay.overlayRef}`,
      `next_graph:${nextGraphFunctionRef}`,
      `next_vector:${nextGraphVectorRef}`
    ])
  });
}

export function deriveSdlcPostActionOverlayReentryActionInput(input: {
  readonly basis: ExecutionBasis;
  readonly module: Module;
  readonly overlayRef: string | null;
  readonly completedGraphVectorRef: string;
  readonly closureDecisionDisposition: string;
  readonly currentVectorIndex: number;
}): OddSdlcEvaluateNextActionInput | null {
  if (input.overlayRef === null) {
    return null;
  }
  const catalog = constructSdlcTraversalOverlayCatalog({
    module: input.module
  });
  const overlay = resolveSdlcTraversalOverlay({
    catalog,
    overlayRef: input.overlayRef
  });
  if (overlay === null) {
    return null;
  }
  const route = sdlcTraversalOverlayFailureReentryRoute({
    overlay,
    completedGraphVectorRef: input.completedGraphVectorRef,
    closureDisposition: input.closureDecisionDisposition
  });
  if (route === null) {
    return null;
  }
  const targetVectorIndex = vectorIndexByEdgeName({
    basis: input.basis,
    edgeName: route.targetGraphVectorName
  });
  if (targetVectorIndex === null || targetVectorIndex > input.currentVectorIndex) {
    return null;
  }
  return postActionCandidateFor({
    basis: input.basis,
    vectorIndex: targetVectorIndex,
    basisKind: `post_${input.closureDecisionDisposition.replace("-", "_")}_overlay_reentry`,
    actionKind: "reenter_graph_span",
    eligibleReasonRefs: uniqueSorted([
      route.routeRef,
      route.overlayRef,
      route.terminalGraphFunctionRef,
      route.sourceGraphVectorRef,
      route.targetGraphVectorRef,
      ...route.reasonRefs
    ])
  });
}

export function deriveSdlcPostProductMaterializationActionResolution(input: {
  readonly module: Module;
  readonly runRef: string;
  readonly downstreamPressureRefs: readonly string[];
  readonly downstreamTargetBindingRefs: readonly string[];
  readonly admittedAssetTypes: readonly string[];
  readonly scopeModuleName?: string | null | undefined;
  readonly scopeScheduleRef?: string | null | undefined;
}): SdlcPostProductMaterializationActionResolution {
  const downstreamPressureRefs = uniqueSorted(input.downstreamPressureRefs);
  const downstreamTargetBindingRefs = uniqueSorted(
    input.downstreamTargetBindingRefs
  );
  const downstreamTargetAssetTypes = uniqueSorted(
    downstreamTargetBindingRefs.flatMap((ref) => {
      const assetType = targetAssetTypeFromBindingRef(ref);
      return assetType === null ? [] : [assetType];
    })
  );
  const admittedAssetTypes = new Set(uniqueSorted(input.admittedAssetTypes));
  if (
    downstreamPressureRefs.length === 0 ||
    downstreamTargetBindingRefs.length === 0
  ) {
    return Object.freeze({ status: "no_pressure" as const });
  }
  if (
    downstreamTargetAssetTypes.length > 0 &&
    downstreamTargetAssetTypes.every((assetType) =>
      admittedAssetTypes.has(assetType)
    )
  ) {
    return Object.freeze({ status: "no_pressure" as const });
  }
  const materializationAction = deriveSdlcPublishedProductMaterializationAction({
    module: input.module,
    downstreamTargetBindingRefs
  });
  if (
    materializationAction.status !== "eligible" ||
    materializationAction.graphFunctionRef === null ||
    materializationAction.publishedActionRef === null
  ) {
    return Object.freeze({
      status: "no_candidate_matched" as const,
      reasonRefs: materializationAction.reasonRefs
    });
  }
  const targetAssetType = materializationAction.outputAssetTypes[0];
  if (targetAssetType === undefined) {
    return Object.freeze({
      status: "no_candidate_matched" as const,
      reasonRefs: materializationAction.reasonRefs
    });
  }
  const graphTrackResolution = graphTrackActionTargetFor({
    module: input.module,
    downstreamTargetBindingRefs,
    admittedAssetTypes: uniqueSorted(input.admittedAssetTypes)
  });
  if (graphTrackResolution.status !== "selected") {
    return Object.freeze({
      status: "blocked" as const,
      blockingReason: makeSdlcBlockingReason({
        code: "post_materialization_graph_track_unresolved",
        detail: graphTrackResolution.reasonRef,
        evidenceRefs: uniqueSorted([
          ...downstreamPressureRefs,
          ...downstreamTargetBindingRefs,
          ...materializationAction.reasonRefs
        ])
      })
    });
  }
  const graphTrackTarget = graphTrackResolution.target;
  const scopeModuleName = input.scopeModuleName ?? null;
  const scopeScheduleRef = input.scopeScheduleRef ?? null;
  const scopePath =
    scopeModuleName === null
      ? EMPTY_SCOPE_PATH
      : Object.freeze(["scope", encodeURIComponent(scopeModuleName)]);
  const targetOutcomeRef = [
      "target-outcome://odd-sdlc/post-action",
      materializationAction.graphFunctionRef,
      targetAssetType,
      ...scopePath,
      encodeURIComponent(input.runRef)
    ].join("/");
  return Object.freeze({
    status: "selected" as const,
    action: Object.freeze({
      actionRef: [
        "construction-action://odd-sdlc/post-action",
        FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
        scopeModuleName === null
          ? "post_downstream_product_materialization"
          : "post_deferred_scope_product_materialization",
        ...(scopeModuleName === null ? [] : [encodeURIComponent(scopeModuleName)]),
        targetOutcomeRef
      ].join("/"),
      actionKind: "invoke_graph_function" as const,
      graphFunctionRef: graphTrackTarget.graphFunctionRef,
      graphVectorRef: graphTrackTarget.graphVectorRef,
      publishedTraversalTargetRef: graphTrackTarget.publishedTraversalTargetRef,
      targetOutcomeRef: graphTrackTarget.targetOutcomeRef,
      inputAssetRefs: Object.freeze([]),
      expectedOutputAssetRefs: Object.freeze(
        uniqueSorted([
          ...materializationAction.outputAssetTypes.map(assetTypeRefFor),
          targetOutcomeRef,
          graphTrackTarget.targetOutcomeRef
        ])
      ),
      requiredAuthorityRefs: uniqueSorted([
        materializationAction.publishedActionRef,
        graphTrackTarget.publishedTraversalTargetRef
      ]),
      eligibleReasonRefs: uniqueSorted([
        "evaluate_next_downstream_requirement_transformation_set",
        `graph_track_function:${graphTrackTarget.graphFunctionName}`,
        `graph_track_vector:${graphTrackTarget.graphVectorName}`,
        `graph_track_target:${graphTrackTarget.publishedTraversalTargetRef}`,
        `graph_track_requested_target:${graphTrackTarget.requestedTargetAssetType}`,
        `graph_track_selected_target:${graphTrackTarget.targetAssetType}`,
        ...(scopeModuleName === null
          ? []
          : [`feature_scope_deferred_module:${scopeModuleName}`]),
        ...(scopeScheduleRef === null
          ? []
          : [`selected_schedule_ref:${scopeScheduleRef}`]),
        ...materializationAction.reasonRefs,
        ...downstreamPressureRefs.map((ref) => `downstream_pressure:${ref}`),
        ...downstreamTargetBindingRefs.map((ref) => `target_binding:${ref}`)
      ])
    })
  });
}

export function deriveSdlcPostProductMaterializationActionInput(input: {
  readonly module: Module;
  readonly runRef: string;
  readonly downstreamPressureRefs: readonly string[];
  readonly downstreamTargetBindingRefs: readonly string[];
  readonly admittedAssetTypes: readonly string[];
  readonly scopeModuleName?: string | null | undefined;
  readonly scopeScheduleRef?: string | null | undefined;
}): OddSdlcEvaluateNextActionInput | null {
  const resolution = deriveSdlcPostProductMaterializationActionResolution(input);
  return resolution.status === "selected" ? resolution.action : null;
}

function postProductMaterializationCandidateFor(input: {
  readonly module: Module;
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly downstreamPressureRefs: readonly string[];
  readonly downstreamTargetBindingRefs: readonly string[];
  readonly admittedAssetTypes: readonly string[];
  readonly scopeModuleName?: string | null | undefined;
  readonly scopeScheduleRef?: string | null | undefined;
}): OddSdlcEvaluateNextActionInput | null {
  const resolution = deriveSdlcPostProductMaterializationActionResolution({
    module: input.module,
    runRef: manifestRefSegment(input.state.manifest),
    downstreamPressureRefs: input.downstreamPressureRefs,
    downstreamTargetBindingRefs: input.downstreamTargetBindingRefs,
    admittedAssetTypes: input.admittedAssetTypes,
    scopeModuleName: input.scopeModuleName,
    scopeScheduleRef: input.scopeScheduleRef
  });
  return resolution.status === "selected" ? resolution.action : null;
}

function deferredProductMaterializationModuleFor(
  state: SdlcAbgOwnedFpDispatchState
): string | null {
  if (
    state.manifest.graphFunctionName !== FG_MATERIALIZE_DECLARED_PRODUCT_ASSET ||
    state.manifest.featureScope.mode !== "steel_thread"
  ) {
    return null;
  }
  return state.manifest.featureScope.deferredModuleNames[0] ?? null;
}

function materializationScheduleRefForModule(moduleName: string): string {
  return [
    "schedule://odd_sdlc",
    FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    moduleName
  ].join("/");
}

function candidateProjectionScopeSegment(
  candidates: readonly OddSdlcEvaluateNextActionInput[]
): string {
  if (candidates.length !== 1) {
    return "mixed";
  }
  const candidate = candidates[0];
  const scopedModule = candidate?.eligibleReasonRefs
    ?.find((ref) => ref.startsWith("feature_scope_deferred_module:"))
    ?.slice("feature_scope_deferred_module:".length);
  return scopedModule === undefined || scopedModule.length === 0
    ? "general"
    : `module/${encodeURIComponent(scopedModule)}`;
}

export function normalizePostCloseContinuationVectorIndex(input: {
  readonly closureDecisionDisposition: string;
  readonly currentVectorIndex: number;
  readonly nextVectorIndex: number | null;
}): number | null {
  if (
    input.closureDecisionDisposition === "close" &&
    input.nextVectorIndex === input.currentVectorIndex
  ) {
    return null;
  }
  return input.nextVectorIndex;
}

function postActionCandidates(input: {
  readonly basis: ExecutionBasis;
  readonly module: Module;
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly gapDossier: SdlcPostflightGapDossier | null;
  readonly closureDecisionDisposition: string;
  readonly nextVectorIndex: number | null;
  readonly activeOverlayRef: string | null;
  readonly completedGraphFunctionRef: string;
  readonly runRef: string;
  readonly downstreamPressureRefs: readonly string[];
  readonly downstreamTargetBindingRefs: readonly string[];
  readonly admittedAssetTypes: readonly string[];
}) {
  const nextVectorIndex = normalizePostCloseContinuationVectorIndex({
    closureDecisionDisposition: input.closureDecisionDisposition,
    currentVectorIndex: input.state.manifest.vectorIndex,
    nextVectorIndex: input.nextVectorIndex
  });
  const nextDeferredModule =
    input.closureDecisionDisposition === "close"
      ? deferredProductMaterializationModuleFor(input.state)
      : null;
  if (nextDeferredModule !== null) {
    const scopeScheduleRef =
      materializationScheduleRefForModule(nextDeferredModule);
    const productMaterializationCandidate =
      postProductMaterializationCandidateFor({
        module: input.module,
        state: input.state,
        downstreamPressureRefs: uniqueSorted([
          input.state.manifest.featureScope.scopeRef,
          scopeScheduleRef,
          ...input.state.manifest.featureScope.basisRefs.map(
            (ref) => `prior_scope_basis:${ref}`
          )
        ]),
        downstreamTargetBindingRefs: input.downstreamTargetBindingRefs,
        admittedAssetTypes: input.admittedAssetTypes,
        scopeModuleName: nextDeferredModule,
        scopeScheduleRef
      });
    if (productMaterializationCandidate !== null) {
      return Object.freeze([productMaterializationCandidate]);
    }
  }
  if (
    input.closureDecisionDisposition === "close" &&
    input.downstreamPressureRefs.length > 0
  ) {
    const productMaterializationCandidate =
      postProductMaterializationCandidateFor({
        module: input.module,
        state: input.state,
        downstreamPressureRefs: input.downstreamPressureRefs,
        downstreamTargetBindingRefs: input.downstreamTargetBindingRefs,
        admittedAssetTypes: input.admittedAssetTypes
      });
    if (productMaterializationCandidate !== null) {
      return Object.freeze([productMaterializationCandidate]);
    }
  }
  if (
    input.closureDecisionDisposition === "close" &&
    nextVectorIndex === null
  ) {
    const overlayContinuationCandidate =
      deriveSdlcPostCloseOverlayContinuationActionInput({
        module: input.module,
        overlayRef: input.activeOverlayRef,
        completedGraphFunctionRef: input.completedGraphFunctionRef,
        runRef: input.runRef
      });
    const nextEligibleOverlayCandidate =
      overlayContinuationCandidate === null
        ? deriveSdlcPostCloseNextEligibleOverlayActionInput({
            module: input.module,
            overlayRef: input.activeOverlayRef,
            completedGraphFunctionRef: input.completedGraphFunctionRef,
            runRef: input.runRef
          })
        : null;
    return Object.freeze(
      overlayContinuationCandidate !== null
        ? [overlayContinuationCandidate]
        : nextEligibleOverlayCandidate === null
          ? []
          : [nextEligibleOverlayCandidate]
    );
  }
  if (
    input.closureDecisionDisposition === "close" &&
    nextVectorIndex !== null
  ) {
    return Object.freeze([
      postActionCandidateFor({
        basis: input.basis,
        vectorIndex: nextVectorIndex,
        basisKind: "post_close_graph_continuation",
        actionKind: "continue_graph_call"
      })
    ]);
  }
  if (
    input.closureDecisionDisposition === "retry" ||
    input.closureDecisionDisposition === "repair" ||
    input.closureDecisionDisposition === "re-enter"
  ) {
    const overlayReentryCandidate = deriveSdlcPostActionOverlayReentryActionInput({
      basis: input.basis,
      module: input.module,
      overlayRef: input.activeOverlayRef,
      completedGraphVectorRef: input.state.manifest.edgeName,
      closureDecisionDisposition: input.closureDecisionDisposition,
      currentVectorIndex: input.state.manifest.vectorIndex
    });
    if (overlayReentryCandidate !== null) {
      return Object.freeze([overlayReentryCandidate]);
    }
  }
  if (input.closureDecisionDisposition === "retry") {
    return Object.freeze([
      postActionCandidateFor({
        basis: input.basis,
        vectorIndex: input.state.manifest.vectorIndex,
        basisKind: "post_retry",
        actionKind: "continue_graph_call"
      })
    ]);
  }
  if (input.closureDecisionDisposition === "repair") {
    const repairGapDossier = input.gapDossier;
    const repairReentryPlans =
      repairGapDossier === null
        ? Object.freeze([])
        : componentRepairReentryPlansForGapDossier({
            manifest: input.state.manifest,
            dossier: repairGapDossier
          });
    const repairReentryVectorIndexes = repairReentryPlans
      .map((plan) =>
        vectorIndexByEdgeName({
          basis: input.basis,
          edgeName: plan.targetEdgeName
        })
      )
      .filter(
        (index): index is number =>
          index !== null && index <= input.state.manifest.vectorIndex
      );
    if (repairReentryVectorIndexes.length > 0) {
      return Object.freeze([
        postActionCandidateFor({
          basis: input.basis,
          vectorIndex: Math.min(...repairReentryVectorIndexes),
          basisKind: "post_repair_reentry",
          actionKind: "reenter_graph_span"
        })
      ]);
    }
    const firstRepairReentryPlan = repairReentryPlans[0];
    if (firstRepairReentryPlan !== undefined) {
      return Object.freeze([
        postRepairGraphFunctionCandidateForPlan({
          plan: firstRepairReentryPlan,
          runRef: input.runRef
        })
      ]);
    }
    return Object.freeze([
      postActionCandidateFor({
        basis: input.basis,
        vectorIndex: input.state.manifest.vectorIndex,
        basisKind: "post_repair",
        actionKind: "repair_same_edge"
      })
    ]);
  }
  if (input.closureDecisionDisposition === "re-enter") {
    return Object.freeze([
      postActionCandidateFor({
        basis: input.basis,
        vectorIndex: input.state.manifest.vectorIndex,
        basisKind: "post_reenter",
        actionKind: "reenter_graph_span"
      })
    ]);
  }
  return Object.freeze([]);
}

function blockingReasonRefsFromCarriers(input: {
  readonly runRef: string;
  readonly scope: string;
  readonly carriers: readonly SdlcBlockingReason[];
}): readonly string[] {
  return uniqueSorted(
    input.carriers.flatMap((reason, index) => [
      `blocking-reason://odd-sdlc/${input.runRef}/${input.scope}/${String(index)}/${reason.code}`,
      ...reason.evidenceRefs
    ])
  );
}

function postProductMaterializationGraphTrackBlockingReasons(input: {
  readonly module: Module;
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly downstreamPressureRefs: readonly string[];
  readonly downstreamTargetBindingRefs: readonly string[];
  readonly admittedAssetTypes: readonly string[];
}): readonly SdlcBlockingReason[] {
  if (
    input.state.status !== "worker_invoked" ||
    input.state.postflight?.status !== "passed" ||
    input.downstreamPressureRefs.length === 0 ||
    input.downstreamTargetBindingRefs.length === 0
  ) {
    return Object.freeze([]);
  }
  const resolution = deriveSdlcPostProductMaterializationActionResolution({
    module: input.module,
    runRef: manifestRefSegment(input.state.manifest),
    downstreamPressureRefs: input.downstreamPressureRefs,
    downstreamTargetBindingRefs: input.downstreamTargetBindingRefs,
    admittedAssetTypes: input.admittedAssetTypes
  });
  return resolution.status === "blocked"
    ? Object.freeze([resolution.blockingReason])
    : Object.freeze([]);
}

function executionEvidenceClosesExecutionResultSource(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly executionEvidence: SdlcWorkerExecutionEvidence;
}): boolean {
  if (input.executionEvidence.reportRefs.length === 0) {
    return false;
  }
  if (input.state.manifest.targetAssetType === "test_execution_result_surface") {
    return input.executionEvidence.status !== "pending";
  }
  return (
    input.executionEvidence.status === "succeeded" &&
    (input.executionEvidence.testsObserved ?? 0) > 0 &&
    (input.executionEvidence.failedCount ?? 0) === 0
  );
}

function testExecutionFailureResidualPressureRefsForState(
  state: SdlcAbgOwnedFpDispatchState
): readonly string[] {
  if (state.manifest.targetAssetType !== "test_execution_result_surface") {
    return Object.freeze([]);
  }
  const executionEvidence = state.workerReport?.executionEvidence ?? null;
  if (executionEvidence === null || executionEvidence.status === "pending") {
    return Object.freeze([]);
  }
  const failed =
    executionEvidence.status === "failed" ||
    (executionEvidence.failedCount ?? 0) > 0;
  if (!failed) {
    return Object.freeze([]);
  }
  return Object.freeze([
    [
      "pressure://odd-sdlc/test_execution_result_failed",
      encodeURIComponent(manifestRefSegment(state.manifest)),
      encodeURIComponent(executionEvidence.status),
      `failed-count:${String(executionEvidence.failedCount ?? "unknown")}`
    ].join("/")
  ]);
}

function closureResidualPressureCarriersForRefs(input: {
  readonly refs: readonly string[];
  readonly lawfulReentryPoint: SdlcBlockingReasonLawfulReentryPoint;
  readonly message: string;
}): readonly ReturnType<typeof makeSdlcClosureResidualPressureCarrier>[] {
  return uniqueSorted(input.refs).map((ref) =>
    makeSdlcClosureResidualPressureCarrier({
      pressureRef: ref,
      lawfulReentryPoint: input.lawfulReentryPoint,
      message: input.message,
      detail: ref,
      evidenceRefs: [ref]
    })
  );
}

export function edgeAssuranceEvidenceCandidatesFor(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly obligationIds: readonly string[];
}): readonly SdlcEdgeEvidenceCandidate[] {
  const closureObligationIds = new Set(input.obligationIds);
  const assessmentCandidates = (input.state.workerReport?.obligationAssessments ??
    Object.freeze([]))
    .filter(
      (assessment) =>
        assessment.fulfillmentStatus === "fulfilled" &&
        closureObligationIds.has(assessment.obligationId)
    )
    .flatMap((assessment) =>
      assessment.evidenceRefs.map((evidenceRef) =>
        Object.freeze({
          kind: "sdlc_edge_evidence_candidate" as const,
          evidenceRef,
          sourceKind:
            assessment.reviewGrade === true
              ? ("review_grade_assessment" as const)
              : ("worker_assessment" as const),
          obligationRefs: Object.freeze([assessment.obligationId]),
          supportsBehavioralFulfillment: true
        })
      )
    );
  const executionEvidence = input.state.workerReport?.executionEvidence ?? null;
  const executionCandidates =
    executionEvidence !== null &&
    executionEvidenceClosesExecutionResultSource({
      state: input.state,
      executionEvidence
    })
      ? executionEvidence.reportRefs.map((evidenceRef) =>
          Object.freeze({
            kind: "sdlc_edge_evidence_candidate" as const,
            evidenceRef,
            sourceKind: "execution_result" as const,
            obligationRefs: Object.freeze(input.obligationIds),
            supportsBehavioralFulfillment: true
          })
        )
      : Object.freeze([] as const);
  return Object.freeze([...assessmentCandidates, ...executionCandidates]);
}

function stateRequiresExecutionEvidence(
  state: SdlcAbgOwnedFpDispatchState
): boolean {
  return state.manifest.targetAssetType === "test_execution_result_surface";
}

function requiredEvidenceSourceKindsForState(
  state: SdlcAbgOwnedFpDispatchState
): readonly SdlcEdgeEvidenceSourceKind[] {
  return Object.freeze([
    ...(stateRequiresExecutionEvidence(state) ? ["execution_result" as const] : []),
    ...(reviewGradeEdgeFulfillmentAssessmentRequired(state.manifest)
      ? ["review_grade_assessment" as const]
      : [])
  ]);
}

function plannedEdgeAssuranceLedgerInputs(input: {
  readonly ledgerRef: string;
  readonly closureDecisionRef: string;
  readonly nextActionProjectionRef: string;
}): readonly SdlcEdgeLedgerInputRef[] {
  return Object.freeze([
    Object.freeze({
      kind: "sdlc_edge_ledger_input_ref" as const,
      ledgerInputKind: "sdlc_edge_fulfillment_ledger",
      ledgerRef: input.ledgerRef
    }),
    Object.freeze({
      kind: "sdlc_edge_ledger_input_ref" as const,
      ledgerInputKind: "sdlc_edge_closure_decision",
      ledgerRef: input.closureDecisionRef
    }),
    Object.freeze({
      kind: "sdlc_edge_ledger_input_ref" as const,
      ledgerInputKind: "sdlc_next_action_projection",
      ledgerRef: input.nextActionProjectionRef
    })
  ]);
}

function targetCarrierRowForInstalledEdge(input: {
  readonly module: Module;
  readonly edgeName: string;
}): SdlcTargetCarrierContractRow {
  return requireSdlcTargetCarrierRow({
    registry: constructSdlcTargetCarrierRegistry({
      module: input.module,
      contracts: Object.freeze([resolveSdlcEdgeGainClosureContract(input.edgeName)])
    }),
    edgeRef: input.edgeName
  });
}

function targetCarrierAdmissionForState(input: {
  readonly module: Module;
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly fpEvaluatorAdmissionEvidenceRefs?: readonly string[] | undefined;
}): SdlcTargetCarrierCandidateAdmission {
  const row = targetCarrierRowForInstalledEdge({
    module: input.module,
    edgeName: input.state.manifest.edgeName
  });
  if (input.state.workerReport === null) {
    return missingSdlcTargetCarrierAdmission({
      row,
      reason: "worker_report_missing"
    });
  }
  const reportRef = pathToFileURL(input.state.manifest.reportFile).href;
  const report = input.state.workerReport;
  const artifactRef = pathToFileURL(report.outputFile).href;
  const targetPayload = targetCarrierPayloadForState({
    state: input.state,
    reportRef,
    artifactRef,
    fpEvaluatorAdmissionEvidenceRefs:
      input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([])
  });
  if (targetPayload.structuralAdmissionStatus === "rejected") {
    return missingSdlcTargetCarrierAdmission({
      row,
      payloadRef: targetPayload.payloadRef,
      reason: targetPayload.structuralBlockingReasons.length === 0
        ? "target_payload_structural_admission_rejected"
        : targetPayload.structuralBlockingReasons.join(",")
    });
  }
  const candidate = sdlcTargetCarrierCandidate({
    row,
    payload: targetPayload.payload,
    summary: report.summary,
    evidenceRefs: targetPayload.evidenceRefs
  });
  return admitSdlcTargetCarrierCandidate({
    row,
    payloadRef: targetPayload.payloadRef,
    candidate
  });
}

function workerResultTargetPayload(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly reportRef: string;
}): Readonly<Record<string, unknown>> {
  const report = input.state.workerReport;
  if (report === null) {
    throw new TypeError("worker result target payload requires a worker report");
  }
  return Object.freeze({
    kind: "sdlc_worker_result_target_payload",
    reportRef: input.reportRef,
    outputFile: report.outputFile,
    digest: report.digest,
    materializedFiles: report.materializedFiles,
    materializationDiagnostics: report.materializationDiagnostics,
    executionEvidence: report.executionEvidence,
    executionEvidenceErrors: report.executionEvidenceErrors,
    obligationAssessments: report.obligationAssessments,
    fpTransformRequestRef: report.fpTransformRequestRef,
    fpTransformResultRef: report.fpTransformResultRef,
    fpTransformStatusSnapshot: report.fpTransformStatusSnapshot,
    fpEvaluateResultRef: report.fpEvaluateResultRef
  });
}

function targetCarrierPayloadForState(input: {
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly reportRef: string;
  readonly artifactRef: string;
  readonly fpEvaluatorAdmissionEvidenceRefs?: readonly string[] | undefined;
}): {
  readonly payload: unknown;
  readonly payloadRef: string;
  readonly evidenceRefs: readonly string[];
  readonly structuralAdmissionStatus: "admitted" | "rejected" | "not_required";
  readonly structuralBlockingReasons: readonly string[];
} {
  const report = input.state.workerReport;
  if (report === null) {
    throw new TypeError("target carrier payload requires a worker report");
  }
  const baseEvidenceRefs = uniqueSorted([
    input.reportRef,
    input.artifactRef,
    ...report.materializedFiles.map(materializedFileRef)
  ]);
  if (input.state.manifest.targetAssetType === "implementation_design_surface") {
    const fpEvaluatorAdmissionEvidenceRefs =
      input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([]);
    const admission =
      fpEvaluatorAdmissionEvidenceRefs.length > 0
        ? admitImplementationDesignRegisterForRuntimeEvaluation({
            manifest: input.state.manifest,
            fpEvaluatorAdmissionEvidenceRefs
          })
        : admitImplementationDesignRegisterForManifest({
            manifest: input.state.manifest
          });
    return Object.freeze({
      payload: admission.register ?? Object.freeze({}),
      payloadRef: input.artifactRef,
      evidenceRefs: uniqueSorted([...baseEvidenceRefs, ...admission.evidenceRefs]),
      structuralAdmissionStatus: admission.status,
      structuralBlockingReasons: admission.blockingReasons
    });
  }
  if (input.state.manifest.targetAssetType === "test_design_surface") {
    const admission = admitTestDesignRegisterFromArtifact({
      targetAssetType: input.state.manifest.targetAssetType,
      outputFile: report.outputFile
    });
    return Object.freeze({
      payload: admission.register ?? Object.freeze({}),
      payloadRef: input.artifactRef,
      evidenceRefs: uniqueSorted([...baseEvidenceRefs, ...admission.evidenceRefs]),
      structuralAdmissionStatus: admission.status,
      structuralBlockingReasons: admission.blockingReasons
    });
  }
  if (input.state.manifest.targetAssetType === "test_execution_surface") {
    const admission = admitTestExecutionSurfaceRegisterFromArtifact({
      targetAssetType: input.state.manifest.targetAssetType,
      outputFile: report.outputFile
    });
    return Object.freeze({
      payload: admission.register ?? Object.freeze({}),
      payloadRef: input.artifactRef,
      evidenceRefs: uniqueSorted([...baseEvidenceRefs, ...admission.evidenceRefs]),
      structuralAdmissionStatus: admission.status,
      structuralBlockingReasons: admission.blockingReasons
    });
  }
  const componentAdmission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: input.state.manifest.targetAssetType,
    outputFile: report.outputFile
  });
  if (componentAdmission.status === "admitted") {
    return Object.freeze({
      payload: componentAdmission.register ?? Object.freeze({}),
      payloadRef: input.artifactRef,
      evidenceRefs: uniqueSorted([
        ...baseEvidenceRefs,
        ...componentAdmission.evidenceRefs
      ]),
      structuralAdmissionStatus: componentAdmission.status,
      structuralBlockingReasons: componentAdmission.blockingReasons
    });
  }
  return Object.freeze({
    payload: workerResultTargetPayload({
      state: input.state,
      reportRef: input.reportRef
    }),
    payloadRef: input.reportRef,
    evidenceRefs: baseEvidenceRefs,
    structuralAdmissionStatus: "not_required" as const,
    structuralBlockingReasons: Object.freeze([])
  });
}

type SdlcAbgTerminalTransitionProjection = {
  readonly kind: "terminal";
  readonly terminalKind: string;
  readonly reason?: string | null;
};

function abgTerminalRetryReasonRefs(input: {
  readonly runRef: string;
  readonly terminal: SdlcAbgTerminalTransitionProjection | null;
}): readonly string[] {
  const terminalKind = input.terminal?.terminalKind ?? null;
  if (terminalKind === null) {
    return Object.freeze([]);
  }
  const reason =
    typeof input.terminal?.reason === "string"
      ? input.terminal.reason
      : terminalKind;
  const retryableTerminal =
    terminalKind === "yielded" ||
    (terminalKind === "gap_stop" && reason.includes("evaluation_set_incomplete"));
  if (!retryableTerminal) {
    return Object.freeze([]);
  }
  return Object.freeze([
    `retry://odd-sdlc/${input.runRef}/abg-terminal/${encodeURIComponent(
      terminalKind
    )}/${encodeURIComponent(reason)}`
  ]);
}

function abgTerminalAllowsInstalledConvergence(input: {
  readonly stateStatus: SdlcInstalledOperatorStatus;
  readonly closureDisposition: SdlcEdgeClosureDisposition;
  readonly terminalKind: TerminalKind | null;
}): boolean {
  return (
    input.stateStatus === "worker_invoked" &&
    input.closureDisposition === "close" &&
    input.terminalKind === "converged"
  );
}

export function deriveSdlcInstalledOperatorStatusFromAbgTerminal(input: {
  readonly stateStatus: SdlcInstalledOperatorStatus;
  readonly closureDisposition: SdlcEdgeClosureDisposition;
  readonly terminalKind: TerminalKind | null;
}): SdlcInstalledOperatorStatus {
  if (input.stateStatus !== "worker_invoked") {
    return input.stateStatus;
  }
  if (abgTerminalAllowsInstalledConvergence(input)) {
    return "converged";
  }
  if (input.closureDisposition === "retry") {
    return "worker_invoked";
  }
  if (input.terminalKind === "gap_stop") {
    return "blocked";
  }
  return input.stateStatus;
}

function abgTraversalTransitionProjectionRef(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly currentVectorIndex: number;
  readonly nextVectorIndex: number | null;
  readonly closureDisposition: SdlcEdgeClosureDisposition;
  readonly terminal: SdlcAbgTerminalTransitionProjection | null;
}): string {
  const terminalKind = input.terminal?.terminalKind ?? null;
  const terminalReason =
    typeof input.terminal?.reason === "string" ? input.terminal.reason : null;
  if (terminalKind === "yielded") {
    return deriveRuntimeContinuationTransitionProjectionFromDisposition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.currentVectorIndex,
      disposition: "yield_continuation",
      reason: "traversal_yield",
      reasonRefs: terminalReason === null ? Object.freeze([]) : [terminalReason]
    }).projectionRef;
  }
  if (input.closureDisposition === "retry") {
    return deriveRuntimeContinuationTransitionProjectionFromDisposition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.currentVectorIndex,
      disposition: "retry_same_edge",
      reason: "typed_retry",
      reasonRefs: Object.freeze(["edge-closure-decision:retry"])
    }).projectionRef;
  }
  if (terminalKind === "gap_stop") {
    return deriveRuntimeContinuationTransitionProjectionFromDisposition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.currentVectorIndex,
      disposition: "block",
      reason: "runtime_blocked",
      reasonRefs: terminalReason === null ? Object.freeze([]) : [terminalReason]
    }).projectionRef;
  }
  if (input.closureDisposition === "close") {
    return deriveRuntimeContinuationTransitionProjectionFromDisposition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.currentVectorIndex,
      disposition: "close",
      reason: "edge_close",
      reasonRefs: Object.freeze(["edge-closure-decision:close"])
    }).projectionRef;
  }
  if (terminalKind === "converged" || terminalKind === "nothing_to_do") {
    return deriveRuntimeContinuationTransitionProjectionFromDisposition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.currentVectorIndex,
      disposition: "close",
      reason: "edge_close",
      reasonRefs: terminalReason === null ? Object.freeze([]) : [terminalReason]
    }).projectionRef;
  }
  if (input.closureDisposition === "yield") {
    return deriveRuntimeContinuationTransitionProjectionFromDisposition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.currentVectorIndex,
      disposition: "yield_continuation",
      reason: "typed_yield",
      reasonRefs: Object.freeze(["edge-closure-decision:yield"])
    }).projectionRef;
  }
  if (input.closureDisposition === "reprice") {
    return deriveRuntimeContinuationTransitionProjectionFromDisposition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.currentVectorIndex,
      disposition: "reprice",
      reason: "typed_reprice",
      reasonRefs: Object.freeze(["edge-closure-decision:reprice"])
    }).projectionRef;
  }
  if (
    input.closureDisposition === "block" ||
    input.closureDisposition === "repair" ||
    input.closureDisposition === "re-enter"
  ) {
    return deriveRuntimeContinuationTransitionProjectionFromDisposition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.currentVectorIndex,
      disposition: "block",
      reason: "typed_block",
      reasonRefs: Object.freeze([
        `edge-closure-decision:${input.closureDisposition}`
      ])
    }).projectionRef;
  }
  if (input.nextVectorIndex !== null) {
    return deriveRuntimeContinuationTransitionProjectionFromDisposition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.nextVectorIndex,
      disposition: "advance_vector",
      reason: "default_iteration_advance",
      reasonRefs: [`next-vector:${input.nextVectorIndex}`]
    }).projectionRef;
  }
  return deriveRuntimeContinuationTransitionProjectionFromDisposition({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    vectorIndex: input.currentVectorIndex,
    disposition: "close",
    reason: "edge_close",
    reasonRefs: Object.freeze(["no-next-vector"])
  }).projectionRef;
}

function deriveInstalledTraversalConsequence(input: {
  readonly basis: ExecutionBasis;
  readonly start: SdlcPublicStartOutcome;
  readonly state: SdlcAbgOwnedFpDispatchState;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly admittedAssetEvents?: readonly RuntimeEvent[];
  readonly emittedEvents: readonly RuntimeEvent[];
  readonly engineTerminal: SdlcAbgTerminalTransitionProjection | null;
  readonly nextVectorIndex: number | null;
  readonly fpEvaluatorAdmissionEvidenceRefs?: readonly string[] | undefined;
  readonly reviewGradeAdmissionEvidenceRefs?: readonly string[] | undefined;
}): SdlcInstalledOperatorTraversalConsequence {
  if (input.start.executionContract === null) {
    throw new TypeError("installed traversal consequence requires execution contract");
  }
  const constructionIntent = input.start.executionContract.constructionIntent;
  const ticketExecutionRefs = sdlcTicketExecutionContractRefs(
    input.start.executionContract.ticketExecutionContract
  );
  const module = constructSdlcGtlModule();
  const fpEvaluateResultRefs = fpEvaluateResultRefsForState(input.state);
  const reviewGradeAdmissionEvidenceRefs = uniqueSorted(
    input.reviewGradeAdmissionEvidenceRefs ?? Object.freeze([])
  );
  const evidenceRefs = uniqueSorted([
    ...traversalConsequenceEvidenceRefs({ state: input.state }),
    ...reviewGradeAdmissionEvidenceRefs
  ]);
  const runRef = manifestRefSegment(input.state.manifest);
  const selectedComposition = input.state.selectedComposition;
  const ledgerRef = `ledger://odd-sdlc/${runRef}/edge-fulfillment`;
  const closureDecisionRef =
    `closure-decision://odd-sdlc/${runRef}/edge-fulfillment/1`;
  const plannedNextActionProjectionRef =
    `next-action://odd-sdlc/${runRef}/edge-assurance/planned`;
  const edgeRef =
    `edge://odd-sdlc/${graphFunctionRefForBasis({ basis: input.basis })}/${input.state.manifest.vectorIndex}`;
  const edgeAssuranceContract = resolveSdlcEdgeGainClosureContract(
    input.state.manifest.edgeName
  );
  const resolvedEdgeAssuranceContractRef =
    sdlcEdgeAssuranceContractRef(edgeAssuranceContract);
  const resolvedEdgeAssuranceContractDigest =
    digestSdlcEdgeGainClosureContract(edgeAssuranceContract);
  const edgeAssuranceContractRef =
    input.state.manifest.edgeAssuranceContractRef ??
    resolvedEdgeAssuranceContractRef;
  const edgeAssuranceContractDigest =
    input.state.manifest.edgeAssuranceContractDigest ??
    resolvedEdgeAssuranceContractDigest;
  if (
    edgeAssuranceContractRef !== resolvedEdgeAssuranceContractRef ||
    edgeAssuranceContractDigest !== resolvedEdgeAssuranceContractDigest
  ) {
    throw new TypeError("installed traversal consequence edge assurance contract drift");
  }
  const admittedAssetTypes = admittedAssetTypesForState({
    state: input.state,
    replayEvents: input.admittedAssetEvents ?? input.replayEvents,
    emittedEvents: input.emittedEvents
  });
  const processEventRefs = workerProcessEvidenceRefs({
    manifest: input.state.manifest,
    workerRun: input.state.workerRun
  });
  const worksiteEvidence = constructSdlcWorksiteEvidence({
    evidenceBundleRef: `evidence://odd-sdlc/${runRef}/worksite`,
    intentRef: constructionIntent.intentRef,
    invocationRef:
      input.state.workerRun === null
        ? pathToFileURL(join(input.state.manifest.archiveRoot, "handoff_manifest.json")).href
        : processStartedRef(input.state.manifest),
    processEventRefs,
    productEvidenceRefs: Object.freeze([
      ...(input.state.workerReport?.materializedFiles.map(materializedFileRef) ??
        [])
    ]),
    admittedProgressRefs: evidenceRefs,
    livenessProjectionRefs:
      input.state.workerRun === null
        ? Object.freeze([])
        : Object.freeze([runtimeLivenessProjectionRef(input.state.manifest)]),
    predecessorRefs: Object.freeze([
      constructionIntent.intentRef,
      constructionIntent.nextActionProjectionRef,
      ...ticketExecutionRefs
    ])
  });
  const fulfillmentProjection = edgeFulfillmentProjectionFor({
    module,
    state: input.state
  });
  const inheritedPressure = inheritedMaterializationPressure({
    selectedActionRef: constructionIntent.selectedActionRef,
    basisRefs: constructionIntent.basisRefs,
    admittedAssetTypes
  });
  const downstreamPressureRefs = uniqueSorted([
    ...fulfillmentProjection.downstreamPressureRefs,
    ...inheritedPressure.downstreamPressureRefs
  ]);
  const downstreamTargetBindingRefs = uniqueSorted([
    ...fulfillmentProjection.downstreamTargetBindingRefs,
    ...inheritedPressure.downstreamTargetBindingRefs
  ]);
  const postActionBlockingReasonCarriers =
    input.state.manifest.graphFunctionName ===
      FG_MATERIALIZE_DECLARED_PRODUCT_ASSET &&
    fulfillmentProjection.nonConvergedReasonRefs.length === 0
      ? postProductMaterializationGraphTrackBlockingReasons({
          module,
          state: input.state,
          downstreamPressureRefs,
          downstreamTargetBindingRefs,
          admittedAssetTypes
        })
      : Object.freeze([]);
  const postActionBlockingReasonRefs = blockingReasonRefsFromCarriers({
    runRef,
    scope: "post-action",
    carriers: postActionBlockingReasonCarriers
  });
  const edgeAssuranceObligations = deriveSdlcEdgeObligations({
    contract: edgeAssuranceContract,
    obligationRefs: fulfillmentProjection.edgeLocalObligationIds
  });
  const targetCarrierAdmission = targetCarrierAdmissionForState({
    module,
    state: input.state,
    fpEvaluatorAdmissionEvidenceRefs:
      input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([])
  });
  const edgeEvidenceAdmission = admitSdlcEdgeEvidence({
    contract: edgeAssuranceContract,
    obligations: edgeAssuranceObligations,
    candidates: edgeAssuranceEvidenceCandidatesFor({
      state: input.state,
      obligationIds: fulfillmentProjection.edgeLocalObligationIds
    }),
    targetCarrierAdmission
  });
  const edgeGain = measureSdlcEdgeGain({
    contract: edgeAssuranceContract,
    obligations: edgeAssuranceObligations,
    admittedEvidence: edgeEvidenceAdmission.admittedEvidence,
    ledgerInputs: plannedEdgeAssuranceLedgerInputs({
      ledgerRef,
      closureDecisionRef,
      nextActionProjectionRef: plannedNextActionProjectionRef
    }),
    targetCarrierAdmission,
    targetCarrierRequired: true,
    requiredEvidenceSourceKinds: requiredEvidenceSourceKindsForState(input.state)
  });
  const measuredEdgeResidualPressure = deriveSdlcEdgeResidualPressure(edgeGain);
  const selectedEvaluationResidualPressureRefs =
    fpEvaluationResidualPressureRefsForState(input.state);
  const reviewGradeResidualPressureCarriers =
    reviewGradeResidualPressureCarriersForState(input.state);
  const reviewGradeResidualPressureCarrierRefs = new Set(
    reviewGradeResidualPressureCarriers.map((carrier) => carrier.pressureRef)
  );
  const selectedEvaluationDefaultResidualPressureRefs =
    selectedEvaluationResidualPressureRefs.filter(
      (ref) => !reviewGradeResidualPressureCarrierRefs.has(ref)
    );
  const testExecutionFailureResidualPressureRefs =
    testExecutionFailureResidualPressureRefsForState(input.state);
  const closureResidualPressureRefs = uniqueSorted([
    ...selectedEvaluationResidualPressureRefs,
    ...testExecutionFailureResidualPressureRefs,
    ...fulfillmentProjection.nonConvergedReasonRefs
  ]);
  const closureResidualPressureCarriers = Object.freeze([
    ...reviewGradeResidualPressureCarriers,
    ...closureResidualPressureCarriersForRefs({
      refs: selectedEvaluationDefaultResidualPressureRefs,
      lawfulReentryPoint: "same_edge_retry",
      message:
        "Selected evaluation residual pressure requires same-edge retry unless a typed upstream route is admitted."
    }),
    ...closureResidualPressureCarriersForRefs({
      refs: testExecutionFailureResidualPressureRefs,
      lawfulReentryPoint: "repair_worker_output",
      message: "Test execution failure pressure requires repair re-entry."
    }),
    ...closureResidualPressureCarriersForRefs({
      refs: fulfillmentProjection.nonConvergedReasonRefs,
      lawfulReentryPoint: "same_edge_retry",
      message:
        "Fulfillment residual pressure requires same-edge retry unless a typed upstream route is admitted."
    })
  ]);
  const edgeResidualPressure = withAdditionalSdlcEdgeResidualPressureRefs({
    residualPressure: measuredEdgeResidualPressure,
    requiredPressureRefs: uniqueSorted([
      ...selectedEvaluationResidualPressureRefs,
      ...testExecutionFailureResidualPressureRefs
    ])
  });
  const edgeAssuranceCloseDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain: edgeGain,
    residualPressure: edgeResidualPressure
  });
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition,
    ledgerRef,
    ledgerVersionRef: `ledger-version://odd-sdlc/${runRef}/edge-fulfillment/1`,
    overlayRef: input.start.executionContract.overlayRef,
    overlayBindingRef: input.start.executionContract.overlayBindingRef,
    graphCatalogDigestRef:
      input.start.executionContract.overlayBinding.graphCatalogDigestRef,
    edgeAssuranceContractRef,
    edgeAssuranceContractDigest,
    targetCarrierContractRef: edgeGain.targetCarrierContractRef,
    targetCarrierContractDigest: edgeGain.targetCarrierContractDigest,
    targetCarrierAdmissionStatus: edgeGain.targetCarrierAdmissionStatus,
    targetCarrierAdmissionRef: edgeGain.targetCarrierAdmissionRef,
    edgeGainRef: edgeGain.gainRef,
    edgeResidualPressureRefs: edgeResidualPressure.requiredPressureRefs,
    edgeRef,
    attemptRef: `attempt://odd-sdlc/${runRef}/${input.state.manifest.vectorIndex}`,
    targetBindingRefs: input.start.executionContract.nextActionProjection.targetBindingRefs,
    evidenceBundleRefs: Object.freeze([worksiteEvidence.evidenceBundleRef]),
    materializationRefs: workerOutputMaterializationRefs(input.state),
    livenessProjectionRefs: worksiteEvidence.livenessProjectionRefs,
    admissionRefs: Object.freeze([
      ...ticketExecutionRefs,
      ...evidenceRefs,
      ...(targetCarrierAdmission?.status === "admitted"
        ? [targetCarrierAdmission.validationRef]
        : [])
    ]),
    downstreamTransformationSetRefs:
      fulfillmentProjection.downstreamTransformationSetRefs,
    downstreamPressureRefs,
    downstreamTargetBindingRefs,
    counts: fulfillmentProjection.counts,
    assessmentCount: fulfillmentProjection.assessmentCount,
    admitted: true,
    targetCertificationPassed: input.state.postflight?.status === "passed",
    fdRecheckPassed:
      input.state.status !== "worker_report_rejected" &&
      postActionBlockingReasonCarriers.length === 0,
    predecessorRefs: Object.freeze([
      constructionIntent.intentRef,
      worksiteEvidence.evidenceBundleRef,
      ...fpEvaluateResultRefs,
      ...reviewGradeAdmissionEvidenceRefs,
      ...ticketExecutionRefs,
      ...input.start.executionContract.nextActionProjection.targetBindingRefs
    ])
  });
  const candidateYieldResumeBasis =
    input.state.status === "worker_report_rejected"
      ? null
      : deriveSdlcUpstreamRepairSurfaceYieldResumeBasis({
          runRef,
          edgeRef: ledger.edgeRef,
          residualPressureCarriers: reviewGradeResidualPressureCarriers,
          livenessProjectionRefs: worksiteEvidence.livenessProjectionRefs
        }) ??
        deriveSdlcProductLineageYieldResumeBasis({
            runRef,
            edgeRef: ledger.edgeRef,
            blockingReasonCarriers: input.state.blockingReasonCarriers,
            productEvidenceRefs: worksiteEvidence.productEvidenceRefs,
            livenessProjectionRefs: worksiteEvidence.livenessProjectionRefs
          });
  const basisScopedRuntimeEvents = runtimeEventsForBasis(
    input.basis,
    Object.freeze([...input.replayEvents, ...input.emittedEvents])
  );
  const abgRuntimeTransitionProjectionSource = deriveRuntimeAggregateProjection(
    input.basis,
    basisScopedRuntimeEvents
  );
  const closureStateTransition = deriveSdlcClosureStateTransition({
    abgRuntimeTransitionContext: {
      basis: input.basis,
      runtimeProjection: abgRuntimeTransitionProjectionSource,
      vectorIndex: input.state.manifest.vectorIndex
    },
    runRef,
    blockingReasonCarriers: input.state.blockingReasonCarriers,
    residualPressureRefs: closureResidualPressureRefs,
    residualPressureCarriers: closureResidualPressureCarriers,
    abgTerminalRetryRefs:
      ledger.edgeConverged && edgeAssuranceCloseDecision.disposition === "close"
        ? Object.freeze([])
        : abgTerminalRetryReasonRefs({
            runRef,
            terminal: input.engineTerminal
          }),
    structuralBlockReasonRefs: uniqueSorted([
      ...structuralBlockReasonRefsForState(input.state)
    ]),
    postActionBlockReasonRefs: postActionBlockingReasonRefs,
    yieldResumeBasis: candidateYieldResumeBasis,
    edgeAssuranceDisposition: edgeAssuranceCloseDecision.disposition
  });
  const closureDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: closureDecisionRef,
    ledger,
    edgeClosureFunctionRef: edgeAssuranceContract.closureFunctionRef,
    edgeAssuranceCloseDecision,
    currentEdgeLawful:
      closureStateTransition.disposition !== "block" &&
      closureStateTransition.disposition !== "reprice",
    retryReasonRefs: closureStateTransition.retryReasonRefs,
    repairReasonRefs: closureStateTransition.repairReasonRefs,
    reenterReasonRefs: closureStateTransition.reenterReasonRefs,
    repriceReasonRefs: closureStateTransition.repriceReasonRefs,
    yieldResumeBasis: closureStateTransition.yieldResumeBasis,
    blockReasonRefs: closureStateTransition.blockReasonRefs,
    closurePolicy: closureStateTransition.closurePolicy
  });
  const postActionGapDossier =
    input.state.gapDossier ??
    syntheticGapDossierFromClosureRefs({
      manifest: input.state.manifest,
      decisionRef: closureDecision.decisionRef,
      reasonRefs: closureDecision.reasonRefs,
      sourceProjectionRef: plannedNextActionProjectionRef,
      residualPressureCarriers: closureResidualPressureCarriers,
      blockingReasonCarriers: input.state.blockingReasonCarriers,
      runRef,
      scope: "state"
    });
  const overlayCatalog = constructSdlcTraversalOverlayCatalog({ module });
  const activeOverlayRef =
    input.start.executionContract?.overlayRef ?? input.state.manifest.overlayRef;
  const completedGraphFunctionRef = input.state.manifest.edgeName;
  const normalizedPostCloseVectorIndex = normalizePostCloseContinuationVectorIndex({
    closureDecisionDisposition: closureDecision.disposition,
    currentVectorIndex: input.state.manifest.vectorIndex,
    nextVectorIndex: input.nextVectorIndex
  });
  const activeOverlay = overlayCatalog.overlays.find(
    (overlay) => overlay.overlayRef === activeOverlayRef
  ) ?? null;
  const overlaySegmentCompletion =
    closureDecision.disposition === "close" &&
    normalizedPostCloseVectorIndex === null &&
    activeOverlay !== null
      ? (() => {
          const productConvergenceAllowed = sdlcTraversalOverlayAllowsProductConvergence({
            overlay: activeOverlay,
            completedGraphFunctionRef,
            module
          });
          const hasRemainingOverlayPressure =
            activeOverlay.termination.remainingGraphPressureRefs.length > 0 ||
            activeOverlay.termination.remainingRequirementPressureRefs.length > 0 ||
            activeOverlay.termination.remainingAssetPressureRefs.length > 0 ||
            activeOverlay.termination.nextEligibleOverlayRefs.length > 0;
          const productConverged =
            productConvergenceAllowed && !hasRemainingOverlayPressure;
          return constructSdlcOverlaySegmentCompletion({
            completionRef: `overlay-segment-completion://odd-sdlc/${runRef}`,
            closureDecision,
            stopDisposition: productConverged
              ? "product_converged"
              : "overlay_segment_complete",
            terminalAssetTypes: activeOverlay.termination.terminalAssetTypes,
            terminalGraphFunctionRefs:
              activeOverlay.termination.terminalGraphFunctionRefs,
            remainingGraphPressureRefs:
              activeOverlay.termination.remainingGraphPressureRefs,
            remainingRequirementPressureRefs:
              activeOverlay.termination.remainingRequirementPressureRefs,
            remainingAssetPressureRefs:
              activeOverlay.termination.remainingAssetPressureRefs,
            nextEligibleOverlayRefs: activeOverlay.termination.nextEligibleOverlayRefs
          });
        })()
      : null;
  const candidates = postActionCandidates({
    basis: input.basis,
    module,
    state: input.state,
    gapDossier: postActionGapDossier,
    closureDecisionDisposition: closureDecision.disposition,
    nextVectorIndex: normalizedPostCloseVectorIndex,
    activeOverlayRef: activeOverlay?.overlayRef ?? null,
    completedGraphFunctionRef,
    runRef,
    downstreamPressureRefs: ledger.downstreamPressureRefs,
    downstreamTargetBindingRefs: ledger.downstreamTargetBindingRefs,
    admittedAssetTypes
  });
  const pressureRef =
    `pressure://odd-sdlc/post-action/${runRef}/${closureDecision.disposition}`;
  const nextActionProjection =
    candidates.length === 0
      ? constructSdlcNextActionProjection({
          selectedComposition,
          nextActionProjectionRef:
            `next-action://odd-sdlc/${runRef}/${closureDecision.disposition}/no-action`,
          intentEventRefs: constructionIntent.intentEventRefs,
          productAssetModelRef: constructionIntent.productAssetModelRef,
          gapPressureRefs: Object.freeze([pressureRef]),
          targetBindingRefs: ledger.targetBindingRefs,
          closureDecision,
          observationRef: `observation://odd-sdlc/post-action/${runRef}`,
          policyRefs: Object.freeze([
            "policy://odd-sdlc/evaluate-next/post-action/no-action"
          ]),
          actionCatalogRefs: Object.freeze([
            `catalog://odd-sdlc/post-action/${runRef}/empty`
          ]),
          overlaySegmentCompletion,
          nextGraphFunctionRef: null,
          nextGraphVectorRef: null
        })
      : (() => {
          const projectionScopeSegment = candidateProjectionScopeSegment(candidates);
          const evaluator = deriveOddSdlcEvaluateNextReport({
            basis: input.basis,
            events: basisScopedRuntimeEvents,
            intentEventRefs: constructionIntent.intentEventRefs,
            productAssetModelRef: constructionIntent.productAssetModelRef,
            episodeId:
              `construction-episode://odd-sdlc/post-action/${runRef}/${projectionScopeSegment}`,
            observationId:
              `construction-observation://odd-sdlc/post-action/${runRef}/${projectionScopeSegment}`,
            pressures: Object.freeze([
              {
                pressureRef,
                pressureKind: "gap_row",
                sourceRef: closureDecision.decisionRef,
                affectedAssetRefs: Object.freeze(
                  candidates.flatMap(
                    (candidate) => candidate.expectedOutputAssetRefs ?? []
                  )
                ),
                targetOutcomeRefs: Object.freeze(
                  candidates.map((candidate) => candidate.targetOutcomeRef)
                ),
                evidenceRefs,
                severity: 1
              }
            ]),
            actions: candidates
          });
          return constructSdlcNextActionProjection({
            selectedComposition,
            nextActionProjectionRef: evaluator.priorityProjection.projectionRef,
            intentEventRefs: evaluator.intentEventRefs,
            productAssetModelRef: evaluator.productAssetModelRef,
            gapPressureRefs: evaluator.gapPressureRefs,
            targetBindingRefs: ledger.targetBindingRefs,
            closureDecision,
            observationRef: evaluator.observation.observationId,
            policyRefs: Object.freeze([
              evaluator.policyCarrierRef,
              evaluator.priorityProjection.prioritySchemeRef
            ]),
            actionCatalogRefs: evaluator.actionCatalogRefs,
            overlaySegmentCompletion,
            selectedActionRef: evaluator.selectedPriorityRow?.actionRef ?? null,
            nextGraphFunctionRef: evaluator.bestGraphFunctionRef,
            nextGraphVectorRef: evaluator.bestGraphVectorRef
          });
        })();
  const postActionOverlayBinding = withSdlcOverlayBindingPostActionEvidence({
    binding: input.start.executionContract.overlayBinding,
    postActionWorkspaceObservationRef: nextActionProjection.observationRef,
    postActionWorkspaceFingerprintRef:
      `workspace-fingerprint://odd-sdlc/post-action/${runRef}`,
    workspaceDeltaRef: `workspace-delta://odd-sdlc/${runRef}`
  });
  const traversalTransitionRef = abgTraversalTransitionProjectionRef({
    basis: input.basis,
    runtimeProjection: abgRuntimeTransitionProjectionSource,
    currentVectorIndex: input.state.manifest.vectorIndex,
    nextVectorIndex: input.nextVectorIndex,
    closureDisposition: closureDecision.disposition,
    terminal: input.engineTerminal
  });
  const admittedStateRef: GtlAdmittedStateRef = Object.freeze({
    compositionRef: selectedComposition.compositionRef,
    compositionDigest: selectedComposition.compositionDigest,
    compositionSelectionRef: selectedComposition.compositionSelectionRef,
    graphCallRef: constructionIntent.intentRef,
    frameRef: pathToFileURL(
      join(input.state.manifest.archiveRoot, "handoff_manifest.json")
    ).href,
    eventRefs: uniqueSorted([
      ...constructionIntent.intentEventRefs,
      ...processEventRefs,
      processEventsRef(input.state.manifest)
    ]),
    ledgerRefs: uniqueSorted([ledger.ledgerVersionRef, closureDecision.decisionRef]),
    projectionRefs: uniqueSorted([
      traversalTransitionRef,
      nextActionProjection.nextActionProjectionRef
    ])
  });
  const consequenceProjection: GtlConsequenceProjectionRef = Object.freeze({
    consequenceRef: `consequence://odd-sdlc/${runRef}/traversal`,
    compositionRef: selectedComposition.compositionRef,
    compositionDigest: selectedComposition.compositionDigest,
    compositionSelectionRef: selectedComposition.compositionSelectionRef,
    assuranceDecisionRef:
      closureDecision.edgeAssuranceDecisionRef ?? closureDecision.decisionRef,
    traversalTransitionRef,
    domainReadModelRefs: uniqueSorted([
      ledger.ledgerVersionRef,
      closureDecision.decisionRef,
      traversalTransitionRef,
      nextActionProjection.nextActionProjectionRef,
      ...(overlaySegmentCompletion === null
        ? []
        : [overlaySegmentCompletion.completionRef])
    ])
  });
  return Object.freeze({
    kind: "sdlc_installed_operator_traversal_consequence" as const,
    selectedComposition,
    constructionIntent,
    worksiteEvidence,
    edgeGain,
    edgeResidualPressure,
    edgeFulfillmentLedger: ledger,
    edgeClosureDecision: closureDecision,
    overlaySegmentCompletion,
    postActionOverlayBinding,
    nextActionProjection,
    admittedStateRef,
    consequenceProjection
  });
}

function overlayScopedAllowedConsequenceTraversalCatalog(input: {
  readonly pluginInput: EnginePluginInput;
  readonly overlayRef: string | null;
}) {
  if (input.overlayRef === null) {
    return constructAllowedConsequenceTraversalCatalog({
      catalogRef: `${input.pluginInput.allowedConsequenceTraversalCatalog.catalogRef}:overlay:none`,
      graphFunctionRef:
        input.pluginInput.allowedConsequenceTraversalCatalog.graphFunctionRef,
      graphVectorRef:
        input.pluginInput.allowedConsequenceTraversalCatalog.graphVectorRef,
      vectorIndex: input.pluginInput.allowedConsequenceTraversalCatalog.vectorIndex,
      edgeRef: input.pluginInput.allowedConsequenceTraversalCatalog.edgeRef,
      rows: Object.freeze([])
    });
  }
  const overlaySegment = `/${encodeURIComponent(input.overlayRef)}/`;
  const rows = Object.freeze(
    input.pluginInput.allowedConsequenceTraversalCatalog.rows.filter((row) =>
      row.rowRef.includes(overlaySegment)
    )
  );
  return constructAllowedConsequenceTraversalCatalog({
    catalogRef:
      `${input.pluginInput.allowedConsequenceTraversalCatalog.catalogRef}:overlay:${encodeURIComponent(input.overlayRef)}`,
    graphFunctionRef:
      input.pluginInput.allowedConsequenceTraversalCatalog.graphFunctionRef,
    graphVectorRef:
      input.pluginInput.allowedConsequenceTraversalCatalog.graphVectorRef,
    vectorIndex: input.pluginInput.allowedConsequenceTraversalCatalog.vectorIndex,
    edgeRef: input.pluginInput.allowedConsequenceTraversalCatalog.edgeRef,
    rows
  });
}

function installedDepthTraversalActionBinding(input: {
  readonly basis: ExecutionBasis;
  readonly pluginInput: EnginePluginInput;
  readonly consequence: SdlcInstalledOperatorTraversalConsequence;
  readonly executionContract: NonNullable<SdlcPublicStartOutcome["executionContract"]>;
  readonly traversalStrategyDecision: SdlcTraversalStrategyDecision;
}) {
  const nextAction = input.consequence.nextActionProjection;
  if (
    input.consequence.edgeClosureDecision.disposition !== "re-enter" ||
    nextAction.nextActionBasisKind !== "post_reenter" ||
    !nextAction.choosesNextTraversal ||
    nextAction.nextGraphFunctionRef === null ||
    nextAction.nextGraphVectorRef === null
  ) {
    return null;
  }
  const targetVectorIndex = vectorIndexByEdgeName({
    basis: input.basis,
    edgeName: nextAction.nextGraphVectorRef
  });
  if (targetVectorIndex === null) {
    throw new TypeError("consequence.C selected depth re-entry without a published target vector");
  }
  const targetVector = input.basis.graph.vectors[targetVectorIndex];
  const sourceNode = targetVector?.source[0];
  if (targetVector === undefined || sourceNode === undefined) {
    throw new TypeError("consequence.C selected depth re-entry with an invalid graph span");
  }
  const selectedTraversalTargetRef = sdlcPublishedTraversalTargetRef({
    graphFunctionRef: nextAction.nextGraphFunctionRef,
    graphVectorRef: nextAction.nextGraphVectorRef
  });
  return constructSdlcConsequenceTraversalActionBinding({
    replay: {
      kind: "sdlc_traversal_consequence_replay" as const,
      refs: {
        kind: "sdlc_traversal_consequence_refs" as const,
        compositionRef: input.consequence.selectedComposition.compositionRef,
        compositionDigest: input.consequence.selectedComposition.compositionDigest,
        compositionSelectionRef:
          input.consequence.selectedComposition.compositionSelectionRef,
        selectedRegimeBindingRef:
          input.consequence.selectedComposition.selectedRegimeBindingRef,
        constructionIntentRef: input.consequence.constructionIntent.intentRef,
        worksiteEvidenceRef: input.consequence.worksiteEvidence.evidenceBundleRef,
        edgeFulfillmentLedgerRef:
          input.consequence.edgeFulfillmentLedger.ledgerVersionRef,
        edgeClosureDecisionRef: input.consequence.edgeClosureDecision.decisionRef,
        nextActionProjectionRef: nextAction.nextActionProjectionRef,
        admittedStateRef: input.consequence.admittedStateRef.frameRef,
        consequenceProjectionRef:
          input.consequence.consequenceProjection.consequenceRef
      },
      constructionIntent: input.consequence.constructionIntent,
      worksiteEvidence: input.consequence.worksiteEvidence,
      edgeFulfillmentLedger: input.consequence.edgeFulfillmentLedger,
      edgeClosureDecision: input.consequence.edgeClosureDecision,
      nextActionProjection: nextAction,
      admittedStateRef: input.consequence.admittedStateRef,
      consequenceProjection: input.consequence.consequenceProjection
    },
    traversalStrategyDecision: input.traversalStrategyDecision,
    sourceNodeRef: sourceNode.id,
    targetNodeRef: targetVector.target.id,
    graphSpanRef:
      `graph-span://odd-sdlc/consequence-depth/${encodeURIComponent(input.pluginInput.edge)}/${String(input.pluginInput.vectorIndex)}/${String(targetVectorIndex)}`,
    reentryTargetRef:
      `graph-reentry-point://odd-sdlc/${encodeURIComponent(nextAction.nextGraphFunctionRef)}/${String(targetVectorIndex)}`,
    targetOutcomeRef: nextAction.nextActionProjectionRef,
    selectedOverlayRef: input.executionContract.overlayRef,
    selectedRefinementBoundaryRef:
      input.executionContract.overlayBinding.annotationRefs[0] ??
      `refinement-boundary://odd-sdlc/depth/${encodeURIComponent(input.executionContract.overlayRef)}`,
    selectedTraversalTargetRef,
    requiredAuthorityRefs: uniqueSorted([
      selectedTraversalTargetRef,
      ...input.executionContract.overlayBinding.annotationRefs,
      ...input.executionContract.overlayBinding.zoomGraphFunctionRefs,
      ...input.executionContract.overlayBinding.zoomTargetGraphFunctionRefs
    ]),
    proportionalityBasisRefs: uniqueSorted([
      input.executionContract.overlayRef,
      input.executionContract.overlayBindingRef,
      ...input.consequence.edgeClosureDecision.reasonRefs,
      ...nextAction.gapPressureRefs
    ]),
    allowedConsequenceTraversalCatalog:
      overlayScopedAllowedConsequenceTraversalCatalog({
        pluginInput: input.pluginInput,
        overlayRef: input.executionContract.overlayRef
      })
  });
}

function writeTraversalConsequenceArchive(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly consequence: SdlcInstalledOperatorTraversalConsequence;
}): void {
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "gtl_admitted_state_ref.json",
    payload: input.consequence.admittedStateRef
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "gtl_consequence_projection_ref.json",
    payload: input.consequence.consequenceProjection
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "sdlc_construction_intent.json",
    payload: input.consequence.constructionIntent
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "sdlc_worksite_evidence.json",
    payload: input.consequence.worksiteEvidence
  });
  if (input.consequence.edgeGain !== undefined) {
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      relativePath: "sdlc_edge_gain.json",
      payload: input.consequence.edgeGain
    });
  }
  if (input.consequence.edgeResidualPressure !== undefined) {
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      relativePath: "sdlc_edge_residual_pressure.json",
      payload: input.consequence.edgeResidualPressure
    });
  }
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "sdlc_edge_fulfillment_ledger.json",
    payload: input.consequence.edgeFulfillmentLedger
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "sdlc_edge_closure_decision.json",
    payload: input.consequence.edgeClosureDecision
  });
  if (input.consequence.overlaySegmentCompletion !== null) {
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      relativePath: "sdlc_overlay_segment_completion.json",
      payload: input.consequence.overlaySegmentCompletion
    });
  }
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "sdlc_overlay_binding_post_action.json",
    payload: input.consequence.postActionOverlayBinding
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "sdlc_next_action_projection.json",
    payload: input.consequence.nextActionProjection
  });
}

function nextLawfulActionFromConsequence(
  consequence: SdlcInstalledOperatorTraversalConsequence
): string {
  return (
    consequence.nextActionProjection.selectedActionRef ??
    `disposition://${consequence.edgeClosureDecision.disposition}`
  );
}

function readOptionalWorkerTextRef(ref: string | null | undefined): string {
  if (ref === null || ref === undefined || !ref.startsWith("file:")) {
    return "";
  }
  try {
    return readFileSync(fileURLToPath(ref), "utf8").slice(0, 65536);
  } catch {
    return "";
  }
}

function readOptionalWorkerTextPath(path: string | null | undefined): string {
  if (path === null || path === undefined) {
    return "";
  }
  try {
    return readFileSync(path, "utf8").slice(0, 65536);
  } catch {
    return "";
  }
}

function workerRunRateLimited(workerRun: SdlcWorkerRunResult): boolean {
  const text = [
    readOptionalWorkerTextRef(workerRun.finalOutputRef),
    readOptionalWorkerTextRef(workerRun.traceResultRef),
    readOptionalWorkerTextPath(workerRun.stdoutPath),
    readOptionalWorkerTextPath(workerRun.stderrPath)
  ].join("\n");
  return (
    /api_error_status["']?\s*:?\s*429/iu.test(text) ||
    /429 Too Many Requests|Too Many Requests|exceeded retry limit|last status:\s*429|request id:/iu.test(
      text
    ) ||
    /monthly usage limit|quota exhausted|quota exceeded|rate limit exceeded|rate[- ]limited/iu.test(
      text
    ) ||
    /"type"\s*:\s*"rate_limit_event"[\s\S]*"rate_limit_info"\s*:\s*\{[\s\S]*"status"\s*:\s*"rejected"/u.test(
      text
    )
  );
}

function workerRunOutputLimitExceeded(workerRun: SdlcWorkerRunResult): boolean {
  const text = [
    readOptionalWorkerTextRef(workerRun.finalOutputRef),
    readOptionalWorkerTextRef(workerRun.traceResultRef),
    readOptionalWorkerTextPath(workerRun.stdoutPath),
    readOptionalWorkerTextPath(workerRun.stderrPath)
  ].join("\n");
  return /max_output_tokens|response exceeded the \d+ output token maximum|output token maximum|CLAUDE_CODE_MAX_OUTPUT_TOKENS/u.test(
    text
  );
}

function workerProcessTextLooksRetryableProviderFailure(text: string): boolean {
  return /ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|EPIPE|socket connection was closed|socket hang up|Unable to connect to API|network error|fetch failed|API Error:\s*5\d\d\b|Internal server error|server-side issue/u.test(
    text
  );
}

function workerRunConnectionFailed(workerRun: SdlcWorkerRunResult): boolean {
  const text = [
    readOptionalWorkerTextRef(workerRun.finalOutputRef),
    readOptionalWorkerTextRef(workerRun.traceResultRef),
    readOptionalWorkerTextPath(workerRun.stdoutPath),
    readOptionalWorkerTextPath(workerRun.stderrPath)
  ].join("\n");
  return workerProcessTextLooksRetryableProviderFailure(text);
}

function workerFailureCode(input: {
  readonly workerRun: SdlcWorkerRunResult;
  readonly silentInactivity: boolean;
}): SdlcBlockingReasonCode {
  if (workerRunOutputLimitExceeded(input.workerRun)) {
    return "worker_output_limit_exceeded";
  }
  if (workerRunRateLimited(input.workerRun)) {
    return "worker_rate_limited";
  }
  if (workerRunConnectionFailed(input.workerRun)) {
    return "worker_connection_failed";
  }
  if (input.workerRun.outcome?.kind === "hard_timeout") {
    return "worker_hard_timeout";
  }
  if (input.silentInactivity || input.workerRun.outcome?.kind === "inactivity_timeout") {
    return "silent_worker_inactivity";
  }
  if (input.workerRun.outcome?.kind === "executor_unavailable") {
    return "worker_executor_unavailable";
  }
  if (input.workerRun.outcome?.kind === "launch_failed") {
    return "worker_launch_failed";
  }
  if (input.workerRun.outcome?.kind === "process_error") {
    return "worker_process_error";
  }
  if (input.workerRun.outcome?.kind === "lost_terminal") {
    return "worker_lost_terminal";
  }
  return "worker_process_failed";
}

export function constructWorkerProcessFailurePostflight(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly workerRun: SdlcWorkerRunResult;
}): SdlcPostflightResult {
  const evidenceRefs = workerProcessEvidenceRefs(input);
  const silentInactivity =
    input.workerRun.outcome?.kind === "inactivity_timeout" ||
    (input.workerRun.timedOut &&
      input.workerRun.stdoutByteCount === 0 &&
      input.workerRun.stderrByteCount === 0 &&
      !existsSync(input.manifest.reportFile));
  const status =
    input.workerRun.status === null
      ? input.workerRun.signal ?? input.workerRun.error ?? "unknown"
      : String(input.workerRun.status);
  const silentRetryAvailable =
    silentInactivity && silentInactivitySharpenedRetryAvailable(input.manifest);
  const processSummaryAdmission = admitWorkerProcessSummary(input.manifest);
  if (silentInactivity && processSummaryAdmission.kind !== "admitted") {
    const carrier = makeSdlcBlockingReason({
      code:
        processSummaryAdmission.kind === "missing"
          ? "worker_process_summary_missing"
          : "worker_process_summary_invalid",
      detail: `${processSummaryAdmission.detail};processSummaryRef=${workerProcessSummaryRef(
        input.manifest
      )}`,
      evidenceRefs
    });
    return Object.freeze({
      kind: "sdlc_operator_postflight_result" as const,
      status: "blocked" as const,
      blockingReasons: Object.freeze([legacyBlockingReasonCode(carrier)]),
      blockingReasonCarriers: Object.freeze([carrier]),
      evidenceRefs
    });
  }
  const processSummary =
    processSummaryAdmission.kind === "admitted"
      ? processSummaryAdmission.summary
      : null;
  const signalSequence =
    processSummary === null || processSummary.signalSequence.length === 0
      ? "none"
      : processSummary.signalSequence
          .map((entry) => `${entry.signal}@${String(entry.elapsedMs)}ms`)
          .join(",");
  const livenessDetail =
    processSummary === null
      ? Object.freeze([] as const)
      : Object.freeze([
          `runtimeLivenessAuthority=${processSummary.runtimeLivenessAuthority}`,
          `runtimeLivenessProjectionRef=${processSummary.runtimeLivenessProjectionRef}`,
          `runtimeLivenessLeaseState=${processSummary.runtimeLivenessLeaseState}`,
          `runtimeLivenessDispositionAction=${processSummary.runtimeLivenessDispositionAction}`,
          `runtimeLivenessDispositionReason=${processSummary.runtimeLivenessDispositionReason}`
        ]);
  const carrier = makeSdlcBlockingReason({
    code: workerFailureCode({
      workerRun: input.workerRun,
      silentInactivity
    }),
    lawfulReentryPoint: silentInactivity
      ? priorSilentInactivityCount(input.manifest) === 0 && silentRetryAvailable
        ? "same_edge_retry"
        : "triage_gap"
      : undefined,
    detail: silentInactivity
      ? [
          `elapsedMs=${String(input.workerRun.elapsedMs)}`,
          `stdoutBytes=${String(input.workerRun.stdoutByteCount)}`,
          `stderrBytes=${String(input.workerRun.stderrByteCount)}`,
          `signal=${input.workerRun.signal ?? "none"}`,
          `outcome=${input.workerRun.outcome?.kind ?? "legacy_timeout"}`,
          `executorProfile=${input.workerRun.executorProfile ?? "unknown"}`,
          `streamModel=${input.workerRun.streamModel ?? "unknown"}`,
          `traceResultRef=${input.workerRun.traceResultRef ?? "unknown"}`,
          `pid=${processSummary?.pid ?? "unknown"}`,
          `hardTimeoutMs=${processSummary?.timeoutMs ?? "unknown"}`,
          `inactivityTimeoutMs=${processSummary?.inactivityTimeoutMs ?? "unknown"}`,
          `heartbeatMs=${processSummary?.heartbeatMs ?? "unknown"}`,
          `lastHeartbeatElapsedMs=${processSummary?.lastHeartbeatElapsedMs ?? "none"}`,
          `signalSequence=${signalSequence}`,
          ...livenessDetail,
          `priorSilentAttempts=${String(priorSilentInactivityCount(input.manifest))}`,
          `sharpenedRetryAvailable=${String(silentRetryAvailable)}`,
          `executionShards=${String(input.manifest.productMaterialization.executionShards.length)}`,
          `executionShardIds=${input.manifest.productMaterialization.executionShards
            .map((shard) => shard.shardId)
            .join(",")}`,
          `processSummaryRef=${workerProcessSummaryRef(input.manifest)}`
        ].join(";")
      : [
          `worker exited non-zero: ${status}`,
          `outcome=${input.workerRun.outcome?.kind ?? "unknown"}`,
          `executorProfile=${input.workerRun.executorProfile ?? "unknown"}`,
          `streamModel=${input.workerRun.streamModel ?? "unknown"}`,
          `apiRetryCount=${String(input.workerRun.apiRetryCount ?? "unknown")}`,
          `finalOutputRef=${input.workerRun.finalOutputRef ?? "none"}`,
          `traceResultRef=${input.workerRun.traceResultRef ?? "unknown"}`
        ].join(";"),
    evidenceRefs
  });
  return Object.freeze({
    kind: "sdlc_operator_postflight_result" as const,
    status: "blocked" as const,
    blockingReasons: Object.freeze([legacyBlockingReasonCode(carrier)]),
    blockingReasonCarriers: Object.freeze([carrier]),
    evidenceRefs
  });
}

function silentInactivitySharpenedRetryAvailable(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return manifest.productMaterialization.executionShards.length > 0;
}

function isSilentWorkerRuntimeReason(
  reason: SdlcPostflightGapDossier["reasons"][number]
): boolean {
  if (reason.blockingReason.code === "silent_worker_inactivity") {
    return true;
  }
  return (
    reason.blockingReason.code === "worker_hard_timeout" &&
    (reason.blockingReason.detail?.includes("stdoutBytes=0;stderrBytes=0") ??
      false)
  );
}

function priorSilentInactivityCount(manifest: SdlcWorkerHandoffManifest): number {
  return manifest.retryContext.priorGapDossiers.reduce(
    (count, dossier) =>
      count +
      dossier.reasons.filter(isSilentWorkerRuntimeReason).length,
    0
  );
}

function workerRuntimeTriageStop(postflight: SdlcPostflightResult): boolean {
  return postflight.blockingReasonCarriers.some(
    (reason) =>
      (reason.reasonClass === "worker_runtime" ||
        reason.reasonClass === "assurance") &&
      reason.lawfulReentryPoint === "triage_gap"
  );
}

function writeRunArchive(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly outcome: SdlcInstalledOperatorStartOutcome;
}): void {
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "run.json",
    payload: input.outcome
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    relativePath: "postmortem.md",
    payload: [
      "# T-064 Installed Operator Run Postmortem",
      "",
      `status: ${input.outcome.status}`,
      `graph_function: ${input.outcome.summary.graphFunctionName ?? "n/a"}`,
      `current_edge: ${input.outcome.summary.currentEdge ?? "n/a"}`,
      `worker_status: ${input.outcome.workerRun?.status ?? "n/a"}`,
      `postflight: ${input.outcome.postflight?.status ?? "n/a"}`,
      `assurance: ${input.outcome.assuranceSatisfaction?.status ?? "n/a"}`,
      `event_sequence: ${input.outcome.emittedRuntimeEventKinds.join(" -> ")}`,
      `event_log: ${input.outcome.eventLogPath}`,
      ""
    ].join("\n")
  });
}

export interface SdlcInstalledOperatorAbgPluginSessionInput {
  readonly workspaceRoot: string;
  readonly start: SdlcPublicStartOutcome;
  readonly workerTransport: string | null;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly effectiveReplayEvents: readonly RuntimeEvent[];
  readonly basis: ExecutionBasis;
  readonly eventGraphEvents?: readonly RuntimeEvent[];
  readonly retryContextOverride?: SdlcWorkerRetryContext | undefined;
  readonly eventSink?: ((event: RuntimeEvent) => void) | undefined;
}

export interface SdlcInstalledOperatorAbgPluginSession {
  readonly plugins: EngineRunnerPluginSet;
  readonly emittedEvents: readonly RuntimeEvent[];
}

interface SdlcInstalledOperatorAbgPluginSessionInternal
  extends SdlcInstalledOperatorAbgPluginSession {
  readonly transport: SdlcWorkerTransportContract | null;
  readonly emitted: RuntimeEvent[];
  readonly dispatchState: { current: SdlcAbgOwnedFpDispatchState | null };
  readonly designDepthFpEvaluatorAdmissionEvidenceRefsForState: (
    state: SdlcAbgOwnedFpDispatchState
  ) => readonly string[];
  readonly reviewGradeAdmissionEvidenceRefsForState: (
    state: SdlcAbgOwnedFpDispatchState
  ) => readonly string[];
}

function createSdlcInstalledOperatorAbgPluginSessionInternal(
  input: SdlcInstalledOperatorAbgPluginSessionInput
): SdlcInstalledOperatorAbgPluginSessionInternal {
  const basis = input.basis;
  const effectiveReplayEvents = input.effectiveReplayEvents;
  const emitted: RuntimeEvent[] = [];
  const emitRuntimeEvent = (event: RuntimeEvent): void => {
    emitted.push(event);
    input.eventSink?.(event);
  };
  const transport =
    input.workerTransport === null ? null : admitWorkerTransport(input.workerTransport);
  const executionContract = input.start.executionContract;
  if (executionContract === null) {
    throw new TypeError(
      "installed operator ABG plugin session requires an execution contract"
    );
  }
  const dispatchState: { current: SdlcAbgOwnedFpDispatchState | null } = {
    current: null
  };
  const designDepthFpEvaluatorAdmissionEvidenceByArchiveRoot = new Map<
    string,
    readonly string[]
  >();
  const reviewGradeAdmissionEvidenceByArchiveRoot = new Map<
    string,
    readonly string[]
  >();
  const designDepthFpEvaluatorAdmissionEvidenceRefsForState = (
    state: SdlcAbgOwnedFpDispatchState
  ): readonly string[] =>
    designDepthFpEvaluatorAdmissionEvidenceByArchiveRoot.get(
      state.manifest.archiveRoot
    ) ?? Object.freeze([]);
  const reviewGradeAdmissionEvidenceRefsForState = (
    state: SdlcAbgOwnedFpDispatchState
  ): readonly string[] =>
    reviewGradeAdmissionEvidenceByArchiveRoot.get(state.manifest.archiveRoot) ??
    Object.freeze([]);
  const admitDispatchConsequence = (
    state: SdlcAbgOwnedFpDispatchState,
    nextVectorIndex: number | null = null
  ): SdlcInstalledOperatorTraversalConsequence => {
    const consequence = deriveInstalledTraversalConsequence({
      basis,
      start: input.start,
      state,
      replayEvents: effectiveReplayEvents,
      emittedEvents: emitted,
      engineTerminal: null,
      nextVectorIndex,
      fpEvaluatorAdmissionEvidenceRefs:
        designDepthFpEvaluatorAdmissionEvidenceRefsForState(state),
      reviewGradeAdmissionEvidenceRefs:
        reviewGradeAdmissionEvidenceRefsForState(state)
    });
    writeTraversalConsequenceArchive({
      manifest: state.manifest,
      consequence
    });
    return consequence;
  };
  const publishDispatchState = (
    state: SdlcAbgOwnedFpDispatchState
  ): SdlcInstalledOperatorTraversalConsequence => {
    dispatchState.current = state;
    return admitDispatchConsequence(state);
  };
  const dispatchThroughInstalledOperator = async (
    pluginInput: EnginePluginInput
  ): Promise<FpDispatchOutcome> => {
      const selectedComposition =
        sdlcSelectedAbgFnCompositionIdentityFromEnginePluginInput(pluginInput);
      const contract = hookContractByEdgeName(pluginInput.edge);
      const projectedRetryContext = mergedRetryContext({
        projected: sdlcWorkerRetryContextFromAbgRetryContext(
          pluginInput.retryContext
        ),
        override: deriveSdlcWorkerRetryContextFromPostActionProjection({
          nextActionProjection: executionContract.nextActionProjection,
          vectorIndex: pluginInput.vectorIndex
        }),
        vectorIndex: pluginInput.vectorIndex
      });
      const retryContextWithRuntimeGaps =
        mergeSdlcWorkerRetryContextWithRuntimeGapRegister({
          projected: projectedRetryContext,
          workspaceRoot: input.workspaceRoot,
          vectorIndex: pluginInput.vectorIndex,
          edgeName: pluginInput.edge,
          targetAssetType: contract.targetAssetType
        });
      const manifest = deriveWorkerHandoffManifest({
        workspaceRoot: input.workspaceRoot,
        ticketExecutionContract: executionContract.ticketExecutionContract,
        overlayRef: executionContract.overlayRef,
        overlayBindingRef: executionContract.overlayBindingRef,
        graphCatalogDigestRef: executionContract.overlayBinding.graphCatalogDigestRef,
        overlayAnnotationRefs: executionContract.overlayBinding.annotationRefs,
        overlayZoomGraphFunctionRefs:
          executionContract.overlayBinding.zoomGraphFunctionRefs,
        overlayZoomTargetGraphFunctionRefs:
          executionContract.overlayBinding.zoomTargetGraphFunctionRefs,
        graphFunctionName: executionContract.targetGraphFunction,
        edgeName: pluginInput.edge,
        vectorIndex: pluginInput.vectorIndex,
        contract,
        fpTransformRequest: pluginInput.fpTransformRequest,
        traversalAttemptEnvelope: pluginInput.traversalAttemptEnvelope,
        conformedProject: executionContract.conformedProject,
        retryContext: mergedRetryContext({
          projected: retryContextWithRuntimeGaps,
          override: input.retryContextOverride,
          vectorIndex: pluginInput.vectorIndex
        }),
        outputAuthorityProjections: pluginInput.outputAuthorityProjections,
        traversalHopSelection: executionContract.traversalHopSelection
      });
      const beforeMaterialization = snapshotProductMaterializationRoot(
        manifest.productMaterialization
      );
      const handoffFiles = writeHandoffFiles(manifest);
      writeFrontDoorTraversalSelectionAudit({
        basis,
        manifest,
        summary: executionContract.traversalDecompositionSummary,
        selection: executionContract.traversalHopSelection
      });
      const expectedAssessmentIds =
        pluginInput.expectedAssessmentIds.length === 0
          ? vectorEvaluatorNames({ basis, vectorIndex: pluginInput.vectorIndex })
          : pluginInput.expectedAssessmentIds;
      const fulfillmentFor = (input: {
        readonly workerRun: SdlcWorkerRunResult | null;
        readonly fulfillmentStatus: "fulfilled" | "partial" | "blocked" | "unfulfilled";
        readonly fulfillmentDetail: string;
        readonly blockingReasons: readonly string[];
        readonly evidenceRefs: readonly string[];
      }): Readonly<Record<string, unknown>> => {
        if (input.workerRun === null) {
          return deterministicFulfillmentArtifact({
            manifest,
            basis,
            expectedAssessmentIds,
            fulfillmentStatus: input.fulfillmentStatus,
            fulfillmentDetail: input.fulfillmentDetail,
            blockingReasons: input.blockingReasons,
            evidenceRefs: input.evidenceRefs
          });
        }
        if (transport === null) {
          throw new TypeError("worker fulfillment requires admitted worker transport");
        }
        return fulfillmentArtifact({
          manifest,
          transport,
          basis,
          expectedAssessmentIds,
          fulfillmentStatus: input.fulfillmentStatus,
          fulfillmentDetail: input.fulfillmentDetail,
          blockingReasons: input.blockingReasons,
          evidenceRefs: input.evidenceRefs
        });
      };
      const completeReportDispatch = async (input: {
        readonly workerRun: SdlcWorkerRunResult | null;
        readonly workerReport: SdlcWorkerResultReport;
        readonly hookWorkerContractRef: string;
        readonly passedFulfillmentDetail: string;
        readonly deferConstructorUntilConsequence?: boolean | undefined;
      }) => {
        const diagnosticState: SdlcAbgOwnedFpDispatchState = {
          status: "worker_invoked",
          manifest,
          selectedComposition,
          workerRun: input.workerRun,
          workerReport: input.workerReport,
          postflight: null,
          assuranceSatisfaction: null,
          gapDossier: null,
          hookOutcome: null,
          blockingReason: null,
          blockingReasonCarriers: Object.freeze([]),
          currentEdge: pluginInput.edge
        };
        const diagnostics = await runSdlcPostTransformDiagnosticFlow({
          state: diagnosticState,
          basis,
          edgeAccountingRow,
          eventSink: (event) => {
            emitRuntimeEvent(event);
          },
          postflightRelativePath: "postflight.json",
          writeMaterializationManifest: true
        });
        const postflight = diagnostics.postflight;
        const assuranceGate = diagnostics.assuranceGate;

        let hookOutcome: SdlcHookTurnOutcome | null = null;
        if (input.deferConstructorUntilConsequence !== true) {
          const constructorResult = constructorResultFromWorkerOutput({
            manifest,
            report: input.workerReport,
            operationType: defaultOperationForTarget(contract.targetAssetType)
          });
          writeSdlcSystemArtifact({
            archiveRoot: manifest.archiveRoot,
            relativePath: "constructor_result.json",
            payload: constructorResult
          });
          const currentHookOutcome = runSdlcHookTurn({
            contract,
            invocation: minimalSdlcHookInvocationForContract({
              contract,
              targetAssetId: constructorResult.outputIdentity.assetId,
              fpWorkerContractRef: input.hookWorkerContractRef
            }),
            constructorResult
          });
          hookOutcome = currentHookOutcome;
          writeSdlcSystemArtifact({
            archiveRoot: manifest.archiveRoot,
            relativePath: "hook_outcome.json",
            payload: currentHookOutcome
          });
          if (currentHookOutcome.postflight?.status !== "passed") {
            const hookDiagnosticReasonCarriers = Object.freeze(
              currentHookOutcome.postflight === null ||
                currentHookOutcome.postflight === undefined
                ? [
                    makeSdlcBlockingReason({
                      code: "hook_diagnostic_missing",
                      evidenceRefs: [
                        pathToFileURL(join(manifest.archiveRoot, "hook_outcome.json")).href
                      ]
                    })
                  ]
                : currentHookOutcome.postflight.blockingReasons.map((reason) =>
                    makeSdlcBlockingReason({
                      code: "hook_diagnostic_failed",
                      detail: reason,
                      evidenceRefs: currentHookOutcome.postflight?.evidenceRefs ?? []
                    })
                  )
            );
            const hookDiagnostics = Object.freeze({
              kind: "sdlc_operator_postflight_result" as const,
              status: "passed" as const,
              blockingReasons: Object.freeze([]),
              blockingReasonCarriers: hookDiagnosticReasonCarriers,
              evidenceRefs: Object.freeze([
                ...(currentHookOutcome.postflight?.evidenceRefs ?? [])
              ])
            });
            writeSdlcSystemArtifact({
              archiveRoot: manifest.archiveRoot,
              relativePath: "hook_diagnostics.json",
              payload: hookDiagnostics
            });
          }
        }
        const current: SdlcAbgOwnedFpDispatchState = {
          status: "worker_invoked",
          manifest,
          selectedComposition,
          workerRun: input.workerRun,
          workerReport: input.workerReport,
          postflight,
          assuranceSatisfaction: assuranceGate.satisfaction,
          gapDossier: null,
          hookOutcome,
          blockingReason: null,
          blockingReasonCarriers: activePostflightBlockingReasonCarriers(postflight),
          currentEdge: null
        };
        const consequence = shouldDeferDispatchConsequenceToFpEvaluator(current)
          ? null
          : publishDispatchState(current);
        if (consequence?.edgeClosureDecision.disposition === "block") {
          return constructFpDispatchOutcome({
            status: "blocked",
            resultRef: consequence.nextActionProjection.nextActionProjectionRef,
            attachedResultArtifact: null,
            evidenceRefs: uniqueSorted([
              ...postflight.evidenceRefs,
              consequence.nextActionProjection.nextActionProjectionRef
            ]),
            reason:
              consequence.edgeClosureDecision.reasonRefs.join(",") ||
              "post_action_blocked"
          });
        }
        if (consequence === null) {
          dispatchState.current = current;
        }
        return constructFpDispatchOutcome({
          status: "dispatched",
          resultRef: dispatchResultRef(manifest),
          attachedResultArtifact: fulfillmentFor({
            workerRun: input.workerRun,
            fulfillmentStatus: "fulfilled",
            fulfillmentDetail: input.passedFulfillmentDetail,
            blockingReasons: Object.freeze([]),
            evidenceRefs: postflight.evidenceRefs
          }),
          evidenceRefs: uniqueSorted([
            ...postflight.evidenceRefs,
            ...(consequence === null
              ? [pathToFileURL(input.workerReport.outputFile).href]
            : [consequence.nextActionProjection.nextActionProjectionRef])
          ])
        });
      };
      const reportAdmissionDiagnosticReason = (
        postflight: SdlcPostflightResult
      ): string =>
        postflight.blockingReasonCarriers
          .map((carrier) => legacyBlockingReasonCode(carrier))
          .join(",") || "worker_report_admission_failed";
      const completeReportAdmissionFailure = (input: {
        readonly workerRun: SdlcWorkerRunResult | null;
        readonly postflight: SdlcPostflightResult;
      }): FpDispatchOutcome => {
        writeSdlcSystemArtifact({
          archiveRoot: manifest.archiveRoot,
          relativePath: "worker_report_admission_postflight.json",
          payload: input.postflight
        });
        const current: SdlcAbgOwnedFpDispatchState = {
          status: "worker_report_rejected",
          manifest,
          selectedComposition,
          workerRun: input.workerRun,
          workerReport: null,
          postflight: input.postflight,
          assuranceSatisfaction: null,
          gapDossier: null,
          hookOutcome: null,
          blockingReason: null,
          blockingReasonCarriers: input.postflight.blockingReasonCarriers,
          currentEdge: pluginInput.edge
        };
        const consequence = publishDispatchState(current);
        const reason = reportAdmissionDiagnosticReason(input.postflight);
        return constructFpDispatchOutcome({
          status: "blocked",
          resultRef: consequence.nextActionProjection.nextActionProjectionRef,
          attachedResultArtifact: runtimeFailureArtifact({
            failureClass: "contract_failure",
            detail: reason
          }),
          evidenceRefs: uniqueSorted([
            ...input.postflight.evidenceRefs,
            consequence.nextActionProjection.nextActionProjectionRef
          ]),
          reason
        });
      };
      const edgeAccountingRow = sdlcExecutiveEdgeAccountingRowFor(pluginInput.edge);
      const workerDispatchAllowed = edgeAccountingRow?.workerDispatchAllowed ?? true;
      if (!workerDispatchAllowed) {
        if (!sdlcInstalledOperatorProjectsOutput(manifest.targetAssetType)) {
          throw new TypeError(
            `${pluginInput.edge}: no-dispatch edge is missing declared edge-output projection policy`
          );
        }
        let workerReport: SdlcWorkerResultReport | null = null;
        try {
          workerReport = noDispatchReport({
            manifest,
            report: buildDeclaredEdgeProjectionPendingReport({ manifest })
          });
          writeSdlcSystemArtifact({
            archiveRoot: manifest.archiveRoot,
            relativePath: "worker_result_report.json",
            payload: workerReport
          });
          writeSdlcSystemArtifact({
            archiveRoot: manifest.archiveRoot,
            relativePath: "post_transform_observation.json",
            payload: {
              kind: "sdlc_post_transform_observation",
              sourceFunction: "system.edge_policy_projection",
              generatedFunction:
                "consequence.edge_projection.writeDeclaredEdgeProjectionOutput",
              previousReportAdmissionError: null,
              materializedFileCount: workerReport.materializedFiles.length,
              outputFile: workerReport.outputFile,
              digest: workerReport.digest
            }
          });
        } catch (error: unknown) {
          const rejectionPostflight = deterministicReportAdmissionPostflight({
            manifest,
            reason:
              error instanceof Error ? error.message : "worker_report_rejected"
          });
          return completeReportAdmissionFailure({
            workerRun: null,
            postflight: rejectionPostflight
          });
        }
        workerReport = workerResultReportWithFpStageRefs({
          manifest,
          report: workerReport
        });
        workerReport = noDispatchReport({ manifest, report: workerReport });
        workerReport = reportWithDeclaredNoDispatchProjection({
          manifest,
          report: workerReport
        });
        writeSdlcSystemArtifact({
          archiveRoot: manifest.archiveRoot,
          relativePath: "worker_result_report.json",
          payload: workerReport
        });
        return completeReportDispatch({
          workerRun: null,
          workerReport,
          hookWorkerContractRef: "worker-dispatch://installed-operator/no-dispatch",
          passedFulfillmentDetail: "installed operator deterministic edge passed",
          deferConstructorUntilConsequence: true
        });
      }
      if (transport === null) {
        throw new TypeError("worker dispatch requires admitted worker transport");
      }
      const workerRun = await invokeWorkerThroughAbgProcessActor({
        transport,
        manifest,
        manifestPath: handoffFiles.manifestPath,
        promptPath: handoffFiles.promptPath,
        pluginInput,
        basis,
        eventSink: (event) => {
          emitRuntimeEvent(event);
        }
      });
      if (workerRun.status !== 0) {
        const failurePostflight = constructWorkerProcessFailurePostflight({
          manifest,
          workerRun
        });
        const stopForRuntimeTriage = workerRuntimeTriageStop(failurePostflight);
        writeSdlcSystemArtifact({
          archiveRoot: manifest.archiveRoot,
          relativePath: "worker_process_failure_postflight.json",
          payload: failurePostflight
        });
        const gapDossier = constructPostflightGapDossier({
          manifest,
          postflight: failurePostflight
        });
        writePostflightGapDossier({ manifest, gapDossier });
        const current: SdlcAbgOwnedFpDispatchState = {
          status: "worker_failed",
          manifest,
          selectedComposition,
          workerRun,
          workerReport: null,
          postflight: failurePostflight,
          assuranceSatisfaction: null,
          gapDossier,
          hookOutcome: null,
          blockingReason: failurePostflight.blockingReasons.join(","),
          blockingReasonCarriers: failurePostflight.blockingReasonCarriers,
          currentEdge: pluginInput.edge
        };
        const consequence = publishDispatchState(current);
        return constructFpDispatchOutcome({
          status: "blocked",
          resultRef: stopForRuntimeTriage
            ? consequence.nextActionProjection.nextActionProjectionRef
            : gapDossier.currentGapDossierRef,
          attachedResultArtifact: stopForRuntimeTriage
            ? null
            : runtimeFailureArtifact({
                failureClass: workerFailureRuntimeFailureClass(failurePostflight),
                detail: failurePostflight.blockingReasons.join(",")
              }),
          evidenceRefs: uniqueSorted([
            ...failurePostflight.evidenceRefs,
            consequence.nextActionProjection.nextActionProjectionRef
          ]),
          reason: failurePostflight.blockingReasons.join(",")
        });
      }
      let workerReport: SdlcWorkerResultReport | null = null;
      try {
        workerReport = buildPostTransformWorkerResultReport({
          manifest,
          before: beforeMaterialization
        });
        writeSdlcSystemArtifact({
          archiveRoot: manifest.archiveRoot,
          relativePath: "worker_result_report.json",
          payload: workerReport
        });
        writeSdlcSystemArtifact({
          archiveRoot: manifest.archiveRoot,
          relativePath: "post_transform_observation.json",
          payload: {
            kind: "sdlc_post_transform_observation",
            sourceFunction: "worker.F_P.transform",
            generatedFunction: "buildPostTransformWorkerResultReport",
            previousReportAdmissionError: null,
            materializedFileCount: workerReport.materializedFiles.length,
            outputFile: workerReport.outputFile,
            digest: workerReport.digest
          }
        });
      } catch (error: unknown) {
        if (workerReport === null) {
          const rejectionPostflight = workerReportAdmissionPostflight({
            manifest,
            workerRun,
            reason:
              error instanceof Error ? error.message : "worker_report_rejected"
          });
          return completeReportAdmissionFailure({
            workerRun,
            postflight: rejectionPostflight
          });
        }
      }
      if (workerReport === null) {
        throw new TypeError("worker report admission did not produce a report");
      }
      workerReport = workerResultReportWithFpStageRefs({
        manifest,
        report: workerReport
      });
      writeSdlcSystemArtifact({
        archiveRoot: manifest.archiveRoot,
        relativePath: "worker_result_report.json",
        payload: workerReport
      });
      writeWorkerFpTransformResult({
        manifest,
        report: workerReport
      });
      return completeReportDispatch({
        workerRun,
        workerReport,
        hookWorkerContractRef: transport.raw,
        passedFulfillmentDetail: "installed operator postflight passed"
      });
  };
  const evaluateFpForInstalledOperatorState = async (
    pluginInput: EnginePluginInput
  ): Promise<FpEvaluationOutcome> => {
      if (dispatchState.current === null) {
        return constructFpEvaluationOutcome({
          status: "blocked",
          reason: "missing installed operator transform state for evaluate.C"
        });
      }
      const fpEvaluatorAdmissionEvidenceRefs =
        designDepthFpEvaluatorAdmissionEvidenceRefsForState(dispatchState.current);
      dispatchState.current = await refreshDesignDepthStateFromFpEvaluatorRegister({
        state: dispatchState.current,
        basis,
        edgeAccountingRow:
          dispatchState.current.currentEdge === null
            ? null
            : sdlcExecutiveEdgeAccountingRowFor(dispatchState.current.currentEdge),
        eventSink: (event) => {
          emitRuntimeEvent(event);
        },
        fpEvaluatorAdmissionEvidenceRefs
      });
      return fpEvaluationOutcomeForDispatchState({
        pluginInput,
        state: dispatchState.current
      });
  };
  const projectConsequenceForInstalledOperatorState = (
    pluginInput: EnginePluginInput
  ): ConsequenceProjectionOutcome => {
      if (dispatchState.current === null) {
        if (
          pluginInput.regime === "F_D" &&
          isConformProjectGraphVectorEdge(pluginInput.edge)
        ) {
          const archiveRoot = join(
            input.workspaceRoot,
            deriveSdlcConformProjectProfileFromWorkspace(input.workspaceRoot)
              .runtimeLayout.operatorRunRoot,
            operatorRunId()
          );
          const managedTraversalManifest =
            deriveConformProjectManagedTraversalManifest({
              workspaceRoot: input.workspaceRoot
            });
          const report = materializeSdlcProjectConformance({
            workspaceRoot: input.workspaceRoot
          });
          writeSdlcSystemArtifact({
            archiveRoot,
            relativePath: "managed_traversal_manifest.json",
            payload: managedTraversalManifest
          });
          writeSdlcSystemArtifact({
            archiveRoot,
            relativePath: "conform_project_report.json",
            payload: report
          });
          const manifestRef = pathToFileURL(
            join(archiveRoot, "managed_traversal_manifest.json")
          ).href;
          const reportRef = pathToFileURL(
            join(archiveRoot, "conform_project_report.json")
          ).href;
          if (report.status !== "passed") {
            return constructConsequenceProjectionOutcome({
              status: "blocked",
              reason: report.conformanceGaps.join(",") || "project_conformance_gaps",
              evidenceRefs: uniqueSorted([
                pluginInput.sourceProjectionRef,
                manifestRef,
                reportRef,
                ...report.materializedTopologyRefs
              ])
            });
          }
          return constructConsequenceProjectionOutcome({
            status: "projected",
            consequenceRef: reportRef,
            domainReadModelRefs: uniqueSorted([
              manifestRef,
              reportRef,
              ...report.materializedTopologyRefs
            ]),
            evidenceRefs: uniqueSorted([
              pluginInput.sourceProjectionRef,
              manifestRef,
              reportRef,
              ...report.materializedTopologyRefs
            ])
          });
        }
        return constructConsequenceProjectionOutcome({
          status: "blocked",
          reason: "missing installed operator transform state for consequence.C"
        });
      }
      const selectedComposition =
        sdlcSelectedAbgFnCompositionIdentityFromEnginePluginInput(pluginInput);
      if (
        selectedComposition.compositionRef !==
          dispatchState.current.selectedComposition.compositionRef ||
        selectedComposition.compositionDigest !==
          dispatchState.current.selectedComposition.compositionDigest ||
        selectedComposition.compositionSelectionRef !==
          dispatchState.current.selectedComposition.compositionSelectionRef
      ) {
        return constructConsequenceProjectionOutcome({
          status: "blocked",
          reason: "selected composition drift for consequence.C"
        });
      }
      let declaredEdgeProjectionRefs: readonly string[];
      try {
        declaredEdgeProjectionRefs = writeDeclaredEdgeProjectionFromConsequence({
          manifest: dispatchState.current.manifest
        });
      } catch (error: unknown) {
        return constructConsequenceProjectionOutcome({
          status: "blocked",
          reason:
            error instanceof Error
              ? error.message
              : "declared edge-output projection failed"
        });
      }
      const consequenceState = stateWithConsequenceProjectedExecutionEvidence({
        state: dispatchState.current
      });
      const previousWorkerReport = dispatchState.current.workerReport;
      dispatchState.current = consequenceState;
      if (
        consequenceState.workerReport !== null &&
        consequenceState.workerReport !== previousWorkerReport
      ) {
        writeSdlcSystemArtifact({
          archiveRoot: consequenceState.manifest.archiveRoot,
          relativePath: "worker_result_report.json",
          payload: consequenceState.workerReport
        });
      }
      const consequence = deriveInstalledTraversalConsequence({
        basis,
        start: input.start,
        state: consequenceState,
        replayEvents: effectiveReplayEvents,
        admittedAssetEvents: input.eventGraphEvents ?? input.replayEvents,
        emittedEvents: emitted,
        engineTerminal: null,
        nextVectorIndex:
          pluginInput.vectorIndex + 1 < basis.graph.vectors.length
            ? pluginInput.vectorIndex + 1
            : null,
        fpEvaluatorAdmissionEvidenceRefs:
          designDepthFpEvaluatorAdmissionEvidenceRefsForState(consequenceState)
      });
      writeTraversalConsequenceArchive({
        manifest: consequenceState.manifest,
        consequence
      });
      let traversalAction: ConsequenceProjectionOutcome["traversalAction"] = null;
      try {
        const binding = installedDepthTraversalActionBinding({
          basis,
          pluginInput,
          consequence,
          executionContract,
          traversalStrategyDecision:
            consequenceState.manifest.traversalStrategyDecision
        });
        traversalAction = binding?.traversalAction ?? null;
      } catch (error: unknown) {
        return constructConsequenceProjectionOutcome({
          status: "blocked",
          reason:
            error instanceof Error
              ? error.message
              : "consequence traversal catalog admission failed",
          evidenceRefs: uniqueSorted([
            pluginInput.sourceProjectionRef,
            consequence.consequenceProjection.consequenceRef,
            pluginInput.allowedConsequenceTraversalCatalog.catalogRef
          ])
        });
      }
      if (
        consequence.edgeClosureDecision.disposition !== "close" &&
        consequence.nextActionProjection.choosesNextTraversal !== true
      ) {
        return constructConsequenceProjectionOutcome({
          status: "blocked",
          reason:
            `consequence bind blocked: ${consequence.edgeClosureDecision.disposition} selected no next traversal`,
          evidenceRefs: uniqueSorted([
            pluginInput.sourceProjectionRef,
            consequence.edgeClosureDecision.decisionRef,
            consequence.nextActionProjection.nextActionProjectionRef,
            consequence.consequenceProjection.consequenceRef
          ])
        });
      }
      return constructConsequenceProjectionOutcome({
        status: "projected",
        consequenceRef: consequence.consequenceProjection.consequenceRef,
        domainReadModelRefs: uniqueSorted([
          ...consequence.consequenceProjection.domainReadModelRefs,
          ...declaredEdgeProjectionRefs
        ]),
        traversalAction,
        evidenceRefs: uniqueSorted([
          pluginInput.sourceProjectionRef,
          consequence.admittedStateRef.compositionRef,
          consequence.consequenceProjection.consequenceRef,
          ...consequence.consequenceProjection.domainReadModelRefs,
          ...declaredEdgeProjectionRefs
        ])
      });
  };
  const evaluateDesignDepthForInstalledOperatorState = async (
    pluginInput: EnginePluginInput
  ): Promise<EvaluationRuleOutcome> => {
      if (dispatchState.current === null) {
        return constructEvaluationRuleOutcome({
          status: "accepted",
          ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          evidenceRefs: Object.freeze([pluginInput.sourceProjectionRef]),
          findingRefs: Object.freeze([
            "finding://odd-sdlc/evaluate/design-depth-register/not-applicable/no-transform-state"
          ]),
          selectedCompositionRef: pluginInput.selectedCompositionRef,
          selectedCompositionDigest: pluginInput.selectedCompositionDigest,
          selectedCompositionSelectionRef:
            pluginInput.selectedCompositionSelectionRef,
          selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
          compositionContributionRef:
            pluginInput.selectedRegimeBindingRef ??
            pluginInput.selectedCompositionRef,
          reason: "design-depth evaluator rule has no transform state for this vector"
        });
      }
      if (
        dispatchState.current.manifest.targetAssetType !==
        "implementation_design_surface"
      ) {
        return constructEvaluationRuleOutcome({
          status: "accepted",
          ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          evidenceRefs: Object.freeze([pluginInput.sourceProjectionRef]),
          findingRefs: Object.freeze([
            `finding://odd-sdlc/${manifestRefSegment(dispatchState.current.manifest)}/evaluate/design-depth-register/not-applicable`
          ]),
          selectedCompositionRef: pluginInput.selectedCompositionRef,
          selectedCompositionDigest: pluginInput.selectedCompositionDigest,
          selectedCompositionSelectionRef:
            pluginInput.selectedCompositionSelectionRef,
          selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
          compositionContributionRef:
            pluginInput.selectedRegimeBindingRef ??
            pluginInput.selectedCompositionRef,
          reason: "design-depth evaluator rule not applicable to non-design edge"
        });
      }
      if (transport === null) {
        return constructEvaluationRuleOutcome({
          status: "blocked",
          ruleRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          evidenceRefs: Object.freeze([pluginInput.sourceProjectionRef]),
          selectedCompositionRef: pluginInput.selectedCompositionRef,
          selectedCompositionDigest: pluginInput.selectedCompositionDigest,
          selectedCompositionSelectionRef:
            pluginInput.selectedCompositionSelectionRef,
          selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
          compositionContributionRef:
            pluginInput.selectedRegimeBindingRef ??
            pluginInput.selectedCompositionRef,
          reason: "fp_worker_unattached"
        });
      }
      const outcome = await materializeDesignDepthRegisterWithFpEvaluator({
        transport,
        manifest: dispatchState.current.manifest,
        pluginInput,
        basis,
        eventSink: (event) => {
          emitRuntimeEvent(event);
        }
      });
      const ruleOutcomeRef = writeDesignDepthFpEvaluatorRuleOutcomeProof({
        manifest: dispatchState.current.manifest,
        outcome
      });
      if (outcome.status === "accepted") {
        designDepthFpEvaluatorAdmissionEvidenceByArchiveRoot.set(
          dispatchState.current.manifest.archiveRoot,
          Object.freeze([ruleOutcomeRef])
        );
      } else {
        dispatchState.current = stateWithBlockedDesignDepthFpEvaluatorOutcome({
          state: dispatchState.current,
          outcome,
          ruleOutcomeRef
        });
      }
      return outcome;
  };
  const evaluateReviewGradeForInstalledOperatorState = async (
    pluginInput: EnginePluginInput
  ): Promise<EvaluationRuleOutcome> => {
      if (dispatchState.current === null) {
        return constructEvaluationRuleOutcome({
          status: "accepted",
          ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          evidenceRefs: Object.freeze([pluginInput.sourceProjectionRef]),
          findingRefs: Object.freeze([
            "finding://odd-sdlc/evaluate/review-grade-edge-fulfillment/not-applicable/no-transform-state"
          ]),
          selectedCompositionRef: pluginInput.selectedCompositionRef,
          selectedCompositionDigest: pluginInput.selectedCompositionDigest,
          selectedCompositionSelectionRef:
            pluginInput.selectedCompositionSelectionRef,
          selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
          compositionContributionRef:
            pluginInput.selectedRegimeBindingRef ??
            pluginInput.selectedCompositionRef,
          reason: "review-grade edge fulfillment rule has no transform state for this vector"
        });
      }
      if (!reviewGradeEdgeFulfillmentAssessmentRequired(dispatchState.current.manifest)) {
        return constructEvaluationRuleOutcome({
          status: "accepted",
          ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          evidenceRefs: Object.freeze([pluginInput.sourceProjectionRef]),
          findingRefs: Object.freeze([
            `finding://odd-sdlc/${manifestRefSegment(dispatchState.current.manifest)}/evaluate/review-grade-edge-fulfillment/not-applicable`
          ]),
          selectedCompositionRef: pluginInput.selectedCompositionRef,
          selectedCompositionDigest: pluginInput.selectedCompositionDigest,
          selectedCompositionSelectionRef:
            pluginInput.selectedCompositionSelectionRef,
          selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
          compositionContributionRef:
            pluginInput.selectedRegimeBindingRef ??
            pluginInput.selectedCompositionRef,
          reason: "review-grade edge fulfillment rule not required for this vector"
        });
      }
      if (transport === null) {
        return constructEvaluationRuleOutcome({
          status: "blocked",
          ruleRef: REVIEW_GRADE_EDGE_FULFILLMENT_RULE_REF,
          ruleRole: "semantic_judgment",
          computeMeans: "F_P",
          evidenceRefs: Object.freeze([pluginInput.sourceProjectionRef]),
          selectedCompositionRef: pluginInput.selectedCompositionRef,
          selectedCompositionDigest: pluginInput.selectedCompositionDigest,
          selectedCompositionSelectionRef:
            pluginInput.selectedCompositionSelectionRef,
          selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
          compositionContributionRef:
            pluginInput.selectedRegimeBindingRef ??
            pluginInput.selectedCompositionRef,
          reason: "fp_worker_unattached"
        });
      }
      const outcome = await materializeReviewGradeEdgeFulfillmentWithFpEvaluator({
        transport,
        manifest: dispatchState.current.manifest,
        pluginInput,
        eventSink: (event) => {
          emitRuntimeEvent(event);
        }
      });
      const ruleOutcomeRef = writeReviewGradeEdgeFulfillmentRuleOutcomeProof({
        manifest: dispatchState.current.manifest,
        outcome
      });
      if (outcome.status === "accepted") {
        reviewGradeAdmissionEvidenceByArchiveRoot.set(
          dispatchState.current.manifest.archiveRoot,
          Object.freeze([ruleOutcomeRef])
        );
      }
      if (dispatchState.current !== null) {
        dispatchState.current = stateWithReviewGradePostflight(dispatchState.current);
      }
      if (
        dispatchState.current !== null &&
        dispatchState.current.workerReport !== null
      ) {
        const assessmentPath = join(
          dispatchState.current.manifest.archiveRoot,
          REVIEW_GRADE_EDGE_FULFILLMENT_ASSESSMENT_FILE
        );
        const admission = admitReviewGradeEdgeFulfillmentAssessmentFromArtifact({
          manifest: dispatchState.current.manifest,
          outputFile: assessmentPath
        });
        if (admission.status === "admitted" && admission.assessment !== null) {
          const workerReport = workerReportWithReviewGradeAssessment({
            report: dispatchState.current.workerReport,
            assessment: admission.assessment,
            targetAssetType: dispatchState.current.manifest.targetAssetType
          });
          dispatchState.current = Object.freeze({
            ...dispatchState.current,
            workerReport
          });
          writeSdlcSystemArtifact({
            archiveRoot: dispatchState.current.manifest.archiveRoot,
            relativePath: "worker_result_report.json",
            payload: workerReport
          });
        }
      }
      return outcome;
  };
  const evaluateTicketWorkflowForInstalledOperatorState = (
    pluginInput: EnginePluginInput
  ): EvaluationRuleOutcome => {
    const base = {
      ruleRef: SDLC_TICKET_WORKFLOW_FD_RULE_REF,
      ruleRole: "semantic_judgment" as const,
      computeMeans: "F_D" as const,
      selectedCompositionRef: pluginInput.selectedCompositionRef,
      selectedCompositionDigest: pluginInput.selectedCompositionDigest,
      selectedCompositionSelectionRef:
        pluginInput.selectedCompositionSelectionRef,
      selectedRegimeBindingRef: pluginInput.selectedRegimeBindingRef,
      compositionContributionRef:
        pluginInput.selectedRegimeBindingRef ??
        pluginInput.selectedCompositionRef
    };
    if (dispatchState.current === null) {
      return constructEvaluationRuleOutcome({
        status: "accepted",
        ...base,
        evidenceRefs: Object.freeze([pluginInput.sourceProjectionRef]),
        findingRefs: Object.freeze([
          "finding://odd-sdlc/ticket-workflow/not-applicable/no-transform-state"
        ]),
        reason: "ticket workflow FD rule has no transform state for this vector"
      });
    }
    const manifest = dispatchState.current.manifest;
    if (
      manifest.graphFunctionName !== "route_ticket_work_item" &&
      manifest.targetAssetType !== "ticket_work_item_route_surface"
    ) {
      return constructEvaluationRuleOutcome({
        status: "accepted",
        ...base,
        evidenceRefs: Object.freeze([pluginInput.sourceProjectionRef]),
        findingRefs: Object.freeze([
          `finding://odd-sdlc/${manifestRefSegment(manifest)}/ticket-workflow/not-applicable`
        ]),
        reason: "ticket workflow FD rule not applicable to non-ticket edge"
      });
    }
    const ticketContract = manifest.ticketExecutionContract ?? null;
    if (ticketContract === null) {
      return constructEvaluationRuleOutcome({
        status: "blocked",
        ...base,
        evidenceRefs: Object.freeze([
          pluginInput.sourceProjectionRef,
          pathToFileURL(join(manifest.archiveRoot, "handoff_manifest.json")).href
        ]),
        findingRefs: Object.freeze([
          `finding://odd-sdlc/${manifestRefSegment(manifest)}/ticket-workflow/missing-execution-contract`
        ]),
        reason: "ticket workflow edge requires admitted ticket execution contract"
      });
    }
    return constructEvaluationRuleOutcome({
      status: "accepted",
      ...base,
      evidenceRefs: uniqueSorted([
        pluginInput.sourceProjectionRef,
        ticketContract.executionContractRef,
        ticketContract.ticketUri,
        ticketContract.ticketDigest,
        ...ticketContract.rulingRefs,
        ...ticketContract.overlayContinuationRefs
      ]),
      findingRefs: Object.freeze([
        `finding://odd-sdlc/${manifestRefSegment(manifest)}/ticket-workflow/admitted/${ticketContract.ticketId}`
      ]),
      reason: "ticket workflow execution contract admitted before F_P route construction"
    });
  };

  const plugins = createSdlcAbgPluginSet({
    dispatch: dispatchThroughInstalledOperator,
    evaluateFp: evaluateFpForInstalledOperatorState,
    projectConsequence: projectConsequenceForInstalledOperatorState,
    evaluateTicketWorkflow: evaluateTicketWorkflowForInstalledOperatorState,
    evaluateDesignDepth: evaluateDesignDepthForInstalledOperatorState,
    evaluateReviewGradeEdgeFulfillment:
      evaluateReviewGradeForInstalledOperatorState
  });
  return Object.freeze({
    plugins,
    emittedEvents: emitted,
    emitted,
    transport,
    dispatchState,
    designDepthFpEvaluatorAdmissionEvidenceRefsForState,
    reviewGradeAdmissionEvidenceRefsForState
  });
}

export function createSdlcInstalledOperatorAbgPluginSession(
  input: SdlcInstalledOperatorAbgPluginSessionInput
): SdlcInstalledOperatorAbgPluginSession {
  return createSdlcInstalledOperatorAbgPluginSessionInternal(input);
}

export async function executeInstalledOperatorStart(input: {
  readonly workspaceRoot: string;
  readonly sourceWorkspaceRoot?: string;
  readonly start: SdlcPublicStartOutcome;
  readonly workerTransport: string | null;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly eventGraphEvents?: readonly RuntimeEvent[];
  readonly retryContextOverride?: SdlcWorkerRetryContext | undefined;
  readonly requireInstalledTopology?: boolean;
}): Promise<SdlcInstalledOperatorStartOutcome> {
  if (input.requireInstalledTopology === true) {
    const topologyValidation = deriveSdlcInstalledQualificationInitialState({
      workspaceRoot: input.workspaceRoot
    });
    const topologyArchiveRoot = join(
      input.workspaceRoot,
      ".ai-workspace",
      "runtime",
      "odd_sdlc",
      "operator-topology",
      operatorRunId()
    );
    writeSdlcInstalledQualificationInitialStateArchive({
      archiveRoot: topologyArchiveRoot,
      validation: topologyValidation
    });
    if (topologyValidation.status !== "valid") {
      return terminalOutcome({
        workspaceRoot: input.workspaceRoot,
        status: "blocked",
        start: input.start,
        transport: null,
        manifest: null,
        workerRun: null,
        workerReport: null,
        postflight: null,
        gapDossier: null,
        hookOutcome: null,
        replayEventCountBefore: input.replayEvents.length,
        replayEventCountAfter: input.replayEvents.length,
        emittedRuntimeEventKinds: Object.freeze([]),
        archiveRoot: topologyArchiveRoot,
        blockingReason: "installed_topology_invalid",
        blockingReasonCarriers: Object.freeze([
          makeSdlcBlockingReason({
            code: "installed_topology_invalid",
            evidenceRefs: [pathToFileURL(topologyArchiveRoot).href]
          })
        ]),
        nextLawfulAction: "run_install_or_repair_installed_topology"
      });
  }
}

type RuntimeEventArchiveScalar = string | number | boolean | null;

function compactRuntimeEventScalar(
  value: unknown
): RuntimeEventArchiveScalar | undefined {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }
  return undefined;
}

function runtimeEventArchiveScalar(
  event: RuntimeEvent,
  key: string
): RuntimeEventArchiveScalar | undefined {
  switch (key) {
    case "eventRef":
      return "eventRef" in event
        ? compactRuntimeEventScalar(event.eventRef)
        : undefined;
    case "eventId":
      return "eventId" in event
        ? compactRuntimeEventScalar(event.eventId)
        : undefined;
    case "basisRef":
      return "basisRef" in event
        ? compactRuntimeEventScalar(event.basisRef)
        : undefined;
    case "decisionRef":
      return "decisionRef" in event
        ? compactRuntimeEventScalar(event.decisionRef)
        : undefined;
    case "resultRef":
      return "resultRef" in event
        ? compactRuntimeEventScalar(event.resultRef)
        : undefined;
    case "payloadRef":
      return "payloadRef" in event
        ? compactRuntimeEventScalar(event.payloadRef)
        : undefined;
    case "payloadClass":
      return "payloadClass" in event
        ? compactRuntimeEventScalar(event.payloadClass)
        : undefined;
    case "schemaRef":
      return "schemaRef" in event
        ? compactRuntimeEventScalar(event.schemaRef)
        : undefined;
    case "contractRef":
      return "contractRef" in event
        ? compactRuntimeEventScalar(event.contractRef)
        : undefined;
    case "contractDigest":
      return "contractDigest" in event
        ? compactRuntimeEventScalar(event.contractDigest)
        : undefined;
    case "digest":
      return "digest" in event
        ? compactRuntimeEventScalar(event.digest)
        : undefined;
    case "producerRef":
      return "producerRef" in event
        ? compactRuntimeEventScalar(event.producerRef)
        : undefined;
    case "sourceEventRef":
      return "sourceEventRef" in event
        ? compactRuntimeEventScalar(event.sourceEventRef)
        : undefined;
    case "actorInvocationId":
      return "actorInvocationId" in event
        ? compactRuntimeEventScalar(event.actorInvocationId)
        : undefined;
    case "authorityRef":
      return "authorityRef" in event
        ? compactRuntimeEventScalar(event.authorityRef)
        : undefined;
    case "inputDigest":
      return "inputDigest" in event
        ? compactRuntimeEventScalar(event.inputDigest)
        : undefined;
    case "validationRef":
      return "validationRef" in event
        ? compactRuntimeEventScalar(event.validationRef)
        : undefined;
    case "evidenceRef":
      return "evidenceRef" in event
        ? compactRuntimeEventScalar(event.evidenceRef)
        : undefined;
    case "frameId":
      return "frameId" in event
        ? compactRuntimeEventScalar(event.frameId)
        : undefined;
    case "vectorIndex":
      return "vectorIndex" in event
        ? compactRuntimeEventScalar(event.vectorIndex)
        : undefined;
    case "edgeName":
      return "edgeName" in event
        ? compactRuntimeEventScalar(event.edgeName)
        : undefined;
    case "graphFunctionName":
      return "graphFunctionName" in event
        ? compactRuntimeEventScalar(event.graphFunctionName)
        : undefined;
    case "targetAssetType":
      return "targetAssetType" in event
        ? compactRuntimeEventScalar(event.targetAssetType)
        : undefined;
    case "status":
      return "status" in event
        ? compactRuntimeEventScalar(event.status)
        : undefined;
    case "reason":
      return "reason" in event
        ? compactRuntimeEventScalar(event.reason)
        : undefined;
    case "routingDecision":
      return "routingDecision" in event
        ? compactRuntimeEventScalar(event.routingDecision)
        : undefined;
    case "correlationId":
      return "correlationId" in event
        ? compactRuntimeEventScalar(event.correlationId)
        : undefined;
    default:
      return undefined;
  }
}

function runtimeEventArchiveStringArray(
  event: RuntimeEvent,
  key: string
): readonly string[] | undefined {
  switch (key) {
    case "affectedFieldRefs":
      return "affectedFieldRefs" in event
        ? compactRuntimeEventStringArray(event.affectedFieldRefs)
        : undefined;
    case "consumedFieldRefs":
      return "consumedFieldRefs" in event
        ? compactRuntimeEventStringArray(event.consumedFieldRefs)
        : undefined;
    case "pressureRefs":
      return "pressureRefs" in event
        ? compactRuntimeEventStringArray(event.pressureRefs)
        : undefined;
    case "diagnosticRefs":
      return "diagnosticRefs" in event
        ? compactRuntimeEventStringArray(event.diagnosticRefs)
        : undefined;
    case "evidenceRefs":
      return "evidenceRefs" in event
        ? compactRuntimeEventStringArray(event.evidenceRefs)
        : undefined;
    case "causationEventRefs":
      return "causationEventRefs" in event
        ? compactRuntimeEventStringArray(event.causationEventRefs)
        : undefined;
    default:
      return undefined;
  }
}

function compactRuntimeEventStringArray(
  value: unknown
): readonly string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const strings = value.filter((item): item is string => typeof item === "string");
  return Object.freeze(strings);
}

function compactRuntimeEventArchivePayload(
  events: readonly RuntimeEvent[]
): Record<string, unknown> {
    const projectedKeys = [
    "eventRef",
    "eventId",
    "basisRef",
    "decisionRef",
    "resultRef",
    "payloadRef",
    "payloadClass",
    "schemaRef",
    "contractRef",
    "contractDigest",
    "digest",
    "producerRef",
    "sourceEventRef",
    "actorInvocationId",
    "authorityRef",
    "inputDigest",
    "validationRef",
    "evidenceRef",
    "frameId",
    "vectorIndex",
    "edgeName",
    "graphFunctionName",
    "targetAssetType",
    "status",
    "reason",
    "routingDecision",
    "correlationId"
  ];
  const projectedArrayKeys = [
    "affectedFieldRefs",
    "consumedFieldRefs",
    "pressureRefs",
    "diagnosticRefs",
    "evidenceRefs",
    "causationEventRefs"
  ];
  const projectedEvents = events.map((event, index) => {
    const projected: Record<string, unknown> = {
      index,
      kind: event.kind
    };
    for (const key of projectedKeys) {
      const value = runtimeEventArchiveScalar(event, key);
      if (value !== undefined) {
        projected[key] = value;
      }
    }
    for (const key of projectedArrayKeys) {
      const value = runtimeEventArchiveStringArray(event, key);
      if (value !== undefined) {
        projected[key] = value;
      }
    }
    return Object.freeze(projected);
  });
  return Object.freeze({
    kind: "sdlc_runtime_event_archive_projection",
    archiveVersion: "ts-runtime-events-projection-v1",
    eventCount: events.length,
    eventKinds: Object.freeze(events.map((event) => event.kind)),
    events: Object.freeze(projectedEvents)
  });
}
  if (input.start.executionContract === null) {
    return terminalOutcome({
      workspaceRoot: input.workspaceRoot,
      status: "blocked",
      start: input.start,
      transport: null,
      manifest: null,
      workerRun: null,
      workerReport: null,
      postflight: null,
      gapDossier: null,
      hookOutcome: null,
      replayEventCountBefore: input.replayEvents.length,
      replayEventCountAfter: input.replayEvents.length,
      emittedRuntimeEventKinds: Object.freeze([]),
      archiveRoot: null,
      blockingReason: "target_unavailable",
      blockingReasonCarriers: Object.freeze([
        makeSdlcBlockingReason({ code: "target_unavailable" })
      ]),
      nextLawfulAction: "fix_target_or_run_gaps"
    });
  }
  const basis = input.start.executionContract.basis;
  const replayCursor = replayEventsWithGraphContinuationCursor({
    basis,
    replayEvents: input.replayEvents,
    nextGraphVectorRef:
      input.start.executionContract.nextActionProjection.nextGraphVectorRef
  });
  const effectiveReplayEvents = replayCursor.replayEvents;
  const sourceWorkspaceRoot = input.sourceWorkspaceRoot ?? input.workspaceRoot;
  const projection = deriveRuntimeAggregateProjection(basis, effectiveReplayEvents);
  const decision = deriveIterationAdvanceDecision(basis, projection);
  if (decision.kind === "converged") {
    return terminalOutcome({
      workspaceRoot: input.workspaceRoot,
      status: "converged",
      start: input.start,
      transport: null,
      manifest: null,
      workerRun: null,
      workerReport: null,
      postflight: null,
      gapDossier: null,
      hookOutcome: null,
      replayEventCountBefore: input.replayEvents.length,
      replayEventCountAfter: input.replayEvents.length,
      emittedRuntimeEventKinds: Object.freeze([]),
      archiveRoot: null,
      blockingReason: null,
      nextLawfulAction: "close_or_reprice"
    });
  }

  const transition = deriveAdvancementTransition(basis, effectiveReplayEvents);
  if (transition.kind === "fd_advance") {
    if (transition.edge !== FG_CONFORM_PROJECT) {
      return terminalOutcome({
        workspaceRoot: input.workspaceRoot,
        status: "blocked",
        start: input.start,
        transport: null,
        manifest: null,
        workerRun: null,
        workerReport: null,
        postflight: null,
        gapDossier: null,
        hookOutcome: null,
        replayEventCountBefore: input.replayEvents.length,
        replayEventCountAfter: input.replayEvents.length,
        emittedRuntimeEventKinds: Object.freeze([]),
        archiveRoot: null,
        blockingReason: `unsupported_fd_transition:${transition.edge}`,
        blockingReasonCarriers: Object.freeze([
          makeSdlcBlockingReason({
            code: "unsupported_fd_transition",
            detail: transition.edge
          })
        ]),
        nextLawfulAction: "reprice_runtime_policy",
        currentEdge: transition.edge
      });
    }
    const archiveRoot = join(
      input.workspaceRoot,
      deriveSdlcConformProjectProfileFromWorkspace(input.workspaceRoot).runtimeLayout
        .operatorRunRoot,
      operatorRunId()
    );
    const managedTraversalManifest =
      deriveConformProjectManagedTraversalManifest({
        workspaceRoot: input.workspaceRoot,
        sourceWorkspaceRoot
      });
    const report = materializeSdlcProjectConformance({
      workspaceRoot: input.workspaceRoot,
      sourceWorkspaceRoot
    });
    writeSdlcSystemArtifact({
      archiveRoot,
      relativePath: "managed_traversal_manifest.json",
      payload: managedTraversalManifest
    });
    writeSdlcSystemArtifact({
      archiveRoot,
      relativePath: "conform_project_report.json",
      payload: report
    });
    const reportRef = pathToFileURL(join(archiveRoot, "conform_project_report.json")).href;
    if (replayCursor.cursorEvents.length > 0) {
      await appendOddSdlcRuntimeEvents({
        workspaceRoot: input.workspaceRoot,
        events: replayCursor.cursorEvents
      });
    }
    const conformanceEvents = await appendFdConformanceRuntimeEvents({
      workspaceRoot: input.workspaceRoot,
      basis,
      replayEvents: effectiveReplayEvents,
      reportRef
    });
    const emitted = Object.freeze([
      ...replayCursor.cursorEvents,
      ...conformanceEvents
    ]);
    const outcome = terminalOutcome({
      workspaceRoot: input.workspaceRoot,
      status: "converged",
      start: input.start,
      transport: null,
      manifest: null,
      workerRun: null,
      workerReport: null,
      postflight: null,
      gapDossier: null,
      hookOutcome: null,
      replayEventCountBefore: input.replayEvents.length,
      replayEventCountAfter: input.replayEvents.length + emitted.length,
      emittedRuntimeEventKinds: Object.freeze(emitted.map((event) => event.kind)),
      archiveRoot,
      blockingReason: report.status === "passed" ? null : report.conformanceGaps.join(","),
      blockingReasonCarriers:
        report.status === "passed"
          ? Object.freeze([])
          : Object.freeze([
              makeSdlcBlockingReason({
                code: "project_conformance_gaps",
                detail: report.conformanceGaps.join(","),
                evidenceRefs: report.materializedTopologyRefs
              })
            ]),
      nextLawfulAction:
        report.status === "passed"
          ? "rerun_start_for_downstream_graph"
          : "repair_project_conformance",
      currentEdge: transition.edge
    });
    writeSdlcSystemArtifact({
      archiveRoot,
      relativePath: "runtime_events.json",
      payload: emitted
    });
    writeSdlcSystemArtifact({
      archiveRoot,
      relativePath: "run.json",
      payload: outcome
    });
    writeSdlcSystemArtifact({
      archiveRoot,
      relativePath: "postmortem.md",
      payload: [
        "# T-087 Project Induction Run Postmortem",
        "",
        `status: ${outcome.status}`,
        `graph_function: ${outcome.summary.graphFunctionName ?? "n/a"}`,
        `current_edge: ${outcome.summary.currentEdge ?? "n/a"}`,
        `conformance: ${report.status}`,
        `conformance_gaps: ${report.conformanceGaps.join(",") || "none"}`,
        `event_sequence: ${outcome.emittedRuntimeEventKinds.join(" -> ")}`,
        `event_log: ${outcome.eventLogPath}`,
        ""
      ].join("\n")
    });
    return outcome;
  }
  if (transition.kind !== "fp_dispatch") {
    return terminalOutcome({
      workspaceRoot: input.workspaceRoot,
      status: "blocked",
      start: input.start,
      transport: null,
      manifest: null,
      workerRun: null,
      workerReport: null,
      postflight: null,
      gapDossier: null,
      hookOutcome: null,
      replayEventCountBefore: input.replayEvents.length,
      replayEventCountAfter: input.replayEvents.length,
      emittedRuntimeEventKinds: Object.freeze([]),
      archiveRoot: null,
      blockingReason: `unsupported_transition:${transition.kind}`,
      blockingReasonCarriers: Object.freeze([
        makeSdlcBlockingReason({
          code: "unsupported_transition",
          detail: transition.kind
        })
      ]),
      nextLawfulAction: "reprice_runtime_policy"
    });
  }

  const transitionEdgeAccountingRow =
    transition.edge === null ? null : sdlcExecutiveEdgeAccountingRowFor(transition.edge);
  const transitionWorkerDispatchAllowed =
    transitionEdgeAccountingRow?.workerDispatchAllowed ?? true;
  if (input.workerTransport === null && transitionWorkerDispatchAllowed) {
    return terminalOutcome({
      workspaceRoot: input.workspaceRoot,
      status: "blocked",
      start: input.start,
      transport: null,
      manifest: null,
      workerRun: null,
      workerReport: null,
      postflight: null,
      gapDossier: null,
      hookOutcome: null,
      replayEventCountBefore: input.replayEvents.length,
      replayEventCountAfter: input.replayEvents.length,
      emittedRuntimeEventKinds: Object.freeze([]),
      archiveRoot: null,
      blockingReason: "fp_worker_unattached",
      blockingReasonCarriers: Object.freeze([
        makeSdlcBlockingReason({ code: "fp_worker_unattached" })
      ]),
      nextLawfulAction: "rerun_start_with_worker_transport",
      currentEdge: transition.edge
    });
  }

  const session = createSdlcInstalledOperatorAbgPluginSessionInternal({
    workspaceRoot: input.workspaceRoot,
    start: input.start,
    workerTransport: input.workerTransport,
    replayEvents: input.replayEvents,
    effectiveReplayEvents,
    basis,
    ...(input.eventGraphEvents === undefined
      ? {}
      : { eventGraphEvents: input.eventGraphEvents }),
    ...(input.retryContextOverride === undefined
      ? {}
      : { retryContextOverride: input.retryContextOverride })
  });
  const emitted = session.emitted;
  const transport = session.transport;
  const designDepthFpEvaluatorAdmissionEvidenceRefsForState =
    session.designDepthFpEvaluatorAdmissionEvidenceRefsForState;
  const reviewGradeAdmissionEvidenceRefsForState =
    session.reviewGradeAdmissionEvidenceRefsForState;
  const engineResult = await runEngineIterateAsync({
    basis,
    runtimeEvents: effectiveReplayEvents,
    eventSink: (event) => {
      emitted.push(event);
    },
    plugins: session.plugins,
    maxAttachedFpAttempts:
      input.start.executionContract.requestedUntil === "first_traversal"
        ? 1
        : SDLC_ABG_ATTACHED_FP_MAX_RETRY_ATTEMPTS,
    pluginResultInterfaceCatalog:
      assertCurrentSdlcGtlProgramConformance().pluginResultInterfaceCatalog
  });
  const completedDispatchState = session.dispatchState.current;
  if (completedDispatchState === null) {
    const eventsToAppend = Object.freeze([
      ...replayCursor.cursorEvents,
      ...emitted
    ]);
    await appendOddSdlcRuntimeEvents({
      workspaceRoot: input.workspaceRoot,
      events: eventsToAppend
    });
    return terminalOutcome({
      workspaceRoot: input.workspaceRoot,
      status: "blocked",
      start: input.start,
      transport,
      manifest: null,
      workerRun: null,
      workerReport: null,
      postflight: null,
      gapDossier: null,
      hookOutcome: null,
      replayEventCountBefore: input.replayEvents.length,
      replayEventCountAfter: input.replayEvents.length + eventsToAppend.length,
      emittedRuntimeEventKinds: Object.freeze(
        eventsToAppend.map((event) => event.kind)
      ),
      archiveRoot: null,
      blockingReason: "unsupported_transition:fp_dispatch_without_plugin_call",
      blockingReasonCarriers: Object.freeze([
        makeSdlcBlockingReason({
          code: "unsupported_transition",
          detail: "fp_dispatch_without_plugin_call"
        })
      ]),
      nextLawfulAction: "reprice_runtime_policy",
      currentEdge: decision.edge
    });
  }
  emitted.push(
    ...repairReentryGraphSpanRuntimeEvents({
      basis,
      outcome: completedDispatchState,
      replayEvents: effectiveReplayEvents,
      emittedEvents: emitted
    })
  );
  const terminal =
    engineResult.transition.kind === "terminal" ? engineResult.transition : null;
  const traversalConsequence = deriveInstalledTraversalConsequence({
    basis,
    start: input.start,
    state: completedDispatchState,
    replayEvents: effectiveReplayEvents,
    admittedAssetEvents: input.eventGraphEvents ?? input.replayEvents,
    emittedEvents: emitted,
    engineTerminal: terminal,
    nextVectorIndex: engineResult.projection.nextVectorIndex,
    fpEvaluatorAdmissionEvidenceRefs:
      designDepthFpEvaluatorAdmissionEvidenceRefsForState(completedDispatchState),
    reviewGradeAdmissionEvidenceRefs:
      reviewGradeAdmissionEvidenceRefsForState(completedDispatchState)
  });
  emitted.push(
    ...postActionReentryGraphSpanRuntimeEvents({
      basis,
      consequence: traversalConsequence,
      currentVectorIndex: completedDispatchState.manifest.vectorIndex,
      replayEvents: effectiveReplayEvents,
      emittedEvents: emitted
    })
  );
  const eventsToAppend = Object.freeze([
    ...replayCursor.cursorEvents,
    ...emitted
  ]);
  await appendOddSdlcRuntimeEvents({
    workspaceRoot: input.workspaceRoot,
    events: eventsToAppend
  });
  writeTraversalConsequenceArchive({
    manifest: completedDispatchState.manifest,
    consequence: traversalConsequence
  });
  const closureDisposition = traversalConsequence.edgeClosureDecision.disposition;
  const effectiveTerminalKind = terminal?.terminalKind ?? null;
  const status = deriveSdlcInstalledOperatorStatusFromAbgTerminal({
    stateStatus: completedDispatchState.status,
    closureDisposition,
    terminalKind: effectiveTerminalKind
  });
  const blockingReason =
    status === "blocked" && terminal?.reason !== null && terminal?.reason !== undefined
      ? terminal.reason
      : completedDispatchState.blockingReason;
  const nextLawfulAction = nextLawfulActionFromConsequence(traversalConsequence);
  const currentEdgeFromConsequence =
    traversalConsequence.nextActionProjection.nextGraphVectorRef ??
    completedDispatchState.manifest.edgeName;
  const currentEdge =
    status === "converged"
      ? null
      : completedDispatchState.status === "worker_invoked"
        ? currentEdgeFromConsequence
        : completedDispatchState.currentEdge;
  const outcome = terminalOutcome({
    workspaceRoot: input.workspaceRoot,
    status,
    start: input.start,
    transport,
    manifest: completedDispatchState.manifest,
    workerRun: completedDispatchState.workerRun,
    workerReport: completedDispatchState.workerReport,
    postflight: completedDispatchState.postflight,
    assuranceSatisfaction: completedDispatchState.assuranceSatisfaction,
    gapDossier: completedDispatchState.gapDossier,
    hookOutcome: completedDispatchState.hookOutcome,
    replayEventCountBefore: input.replayEvents.length,
    replayEventCountAfter: input.replayEvents.length + eventsToAppend.length,
    emittedRuntimeEventKinds: Object.freeze(
      eventsToAppend.map((event) => event.kind)
    ),
    archiveRoot: completedDispatchState.manifest.archiveRoot,
    blockingReason,
    blockingReasonCarriers: completedDispatchState.blockingReasonCarriers,
    nextLawfulAction,
    traversalConsequence,
    currentEdge
  });
  writeSdlcSystemArtifact({
    archiveRoot: completedDispatchState.manifest.archiveRoot,
    relativePath: "runtime_events.json",
    payload: compactRuntimeEventArchivePayload(eventsToAppend)
  });
  writeRunArchive({ manifest: completedDispatchState.manifest, outcome });
  if (completedDispatchState.status === "worker_invoked") {
    writeSdlcSystemArtifact({
      archiveRoot: completedDispatchState.manifest.archiveRoot,
      relativePath: "operator_summary.json",
      payload: outcome.summary
    });
    writeSdlcSystemArtifact({
      archiveRoot: completedDispatchState.manifest.archiveRoot,
      relativePath: "run_compact.json",
      payload: {
        status: outcome.status,
        graphFunctionName: outcome.summary.graphFunctionName,
        nextEdge: outcome.summary.currentEdge,
        eventKinds: outcome.emittedRuntimeEventKinds,
        replayEventCountBefore: outcome.replayEventCountBefore,
        replayEventCountAfter: outcome.replayEventCountAfter,
        assuranceStatus: outcome.assuranceSatisfaction?.status ?? null,
        outputFile: outcome.workerReport?.outputFile ?? null,
        materializedFileCount: outcome.workerReport?.materializedFiles.length ?? 0
      }
    });
    writeSdlcSystemArtifact({
      archiveRoot: completedDispatchState.manifest.archiveRoot,
      relativePath: "run_compact.txt",
      payload: stableOperatorJson(outcome.summary)
    });
  }
  return outcome;
}
