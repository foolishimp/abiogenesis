// Implements: T-181

import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  type GtlEvaluation,
  type GtlEvaluationCloseDispositionKind,
  type GtlEvaluationFindingRef
} from "@abiogenesis/typescript-tenant";
import {
  legacyBlockingReasonCode,
  makeSdlcBlockingReason,
  type SdlcBlockingReason
} from "../../../shared/blocking_reason.js";
import { uniqueLocaleSorted as uniqueSorted } from "../../../shared/collections.js";
import { sha256Text } from "../../../shared/digest.js";
import { pathIsInside } from "../../../shared/path.js";
import {
  sdlcRunRefSegmentFromArchiveRoot,
  type SdlcSelectedAbgFnCompositionIdentity
} from "../../composition_identity.js";
import {
  evaluateAdrOutputArtifact,
  evaluateExecutionEvidence,
  evaluateComponentDepthTargetCarrier,
  evaluateCodeBuilderSourceTestFrontier,
  evaluateCodeBuilderValidationLogs,
  evaluateMaterializedProductFiles,
  evaluateObligationAssessments,
  evaluateStagedConstructionAuthority,
  evaluateWorkerAuthorityReadBoundary
} from "./postflight_checks.js";
import { resolveProductMaterializationReplay } from "../transform/result_projection.js";
import { sdlcInstalledOperatorProjectsOutput } from "../../edge_output_policy.js";
import { writeSdlcSystemArtifact } from "../../system_artifacts.js";
import {
  admitComputeSubworkstreamManifest,
  computeSubworkstreamCounts,
  defaultComputeSubworkstreamManifest,
  SDLC_EVALUATE_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE
} from "../../compute_subworkstreams.js";
import {
  admittedDesignDepthFpEvaluatorRegisterEvidenceRefs,
  admitImplementationDesignRegisterForRuntimeEvaluation,
  shouldDeferImplementationDesignRegisterToFpEvaluator
} from "./design_depth_register.js";
import type {
  SdlcFpEvaluateResult,
  SdlcPostflightResult,
  SdlcWorkerObligationAssessment,
  SdlcWorkerHandoffManifest,
  SdlcWorkerResultReport
} from "../../carriers.js";

function activeComputeStageBlockingReasonCarriers(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly blockingReasonCarriers: readonly SdlcBlockingReason[];
}): readonly SdlcBlockingReason[] {
  const structuralCarrierBlockingReasons = input.blockingReasonCarriers.filter(
    (reason) =>
      reason.code === "staged_authority_missing" ||
      reason.code === "staged_authority_admission_invalid" ||
      reason.code === "staged_decomposition_rejected" ||
      reason.code === "design_depth_fp_evaluator_pending" ||
      reason.code === "design_depth_register_admission_invalid" ||
      reason.code === "component_depth_register_admission_invalid"
  );
  const materializedProductBindingBlockingReasons =
    input.blockingReasonCarriers.filter(
      (reason) => reason.code === "materialized_product_module_system_mismatch"
    );
  if (input.manifest.targetAssetType === "component_code_surface") {
    return Object.freeze(
      [
        ...structuralCarrierBlockingReasons,
        ...materializedProductBindingBlockingReasons,
        ...input.blockingReasonCarriers.filter(
          (reason) =>
            reason.code === "code_builder_parallel_frontier_missing" ||
            reason.code === "code_builder_parallel_test_lanes_missing" ||
            reason.code === "code_builder_validation_command_failed" ||
            reason.code === "materialized_product_role_policy_mismatch"
        )
      ]
    );
  }
  if (
    input.manifest.targetAssetType === "component_test_surface" ||
    input.manifest.targetAssetType === "uat_test_source_surface"
  ) {
    return Object.freeze(
      [
        ...structuralCarrierBlockingReasons,
        ...materializedProductBindingBlockingReasons
      ]
    );
  }
  if (input.manifest.targetAssetType !== "test_execution_result_surface") {
    return Object.freeze(structuralCarrierBlockingReasons);
  }
  return Object.freeze(
    [
      ...structuralCarrierBlockingReasons,
      ...input.blockingReasonCarriers.filter(
        (reason) =>
          reason.code === "test_execution_evidence_missing" ||
          reason.code === "test_execution_evidence_invalid"
      )
    ]
  );
}

export function evaluateSdlcComputeStage(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly fpEvaluatorAdmissionEvidenceRefs?: readonly string[] | undefined;
}): SdlcPostflightResult {
  const replayResolution = resolveProductMaterializationReplay(input);
  const report = replayResolution.report;
  const blockingReasonCarriers: SdlcBlockingReason[] = [];
  const materializationDiagnostics = report.materializationDiagnostics ?? [];
  for (const diagnostic of materializationDiagnostics) {
    blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: diagnostic.code,
        detail: diagnostic.detail,
        evidenceRefs: diagnostic.evidenceRefs
      })
    );
  }
  for (const diagnostic of replayResolution.diagnostics) {
    blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: diagnostic.code,
        detail: diagnostic.detail,
        evidenceRefs: diagnostic.evidenceRefs
      })
    );
  }
  evaluateWorkerAuthorityReadBoundary({
    manifest: input.manifest,
    blockingReasonCarriers
  });
  if (!shouldDeferImplementationDesignRegisterToFpEvaluator(input.manifest)) {
    evaluateStagedConstructionAuthority({
      manifest: input.manifest,
      blockingReasonCarriers,
      fpEvaluatorAdmissionEvidenceRefs:
        input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([])
    });
  }
  const outputFile = resolve(report.outputFile);
  const outputEvidenceRef = pathToFileURL(outputFile).href;
  if (outputFile !== resolve(input.manifest.outputFile)) {
    blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "output_file_manifest_mismatch",
        evidenceRefs: [outputEvidenceRef]
      })
    );
  }
  const edgePolicyProjectionOutput =
    sdlcInstalledOperatorProjectsOutput(input.manifest.targetAssetType) &&
    outputFile === resolve(input.manifest.outputFile);
  const edgePolicyProjectionPending =
    edgePolicyProjectionOutput && !existsSync(outputFile);
  if (
    !edgePolicyProjectionOutput &&
    !input.manifest.allowedWriteRoots.some((root) =>
      pathIsInside(outputFile, root)
    )
  ) {
    blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "output_file_outside_allowed_root",
        evidenceRefs: [outputEvidenceRef]
      })
    );
  }
  if (!existsSync(outputFile)) {
    if (!edgePolicyProjectionOutput) {
      blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "output_file_missing",
          evidenceRefs: [outputEvidenceRef]
        })
      );
    }
  } else if (!statSync(outputFile).isFile()) {
    blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "output_path_not_file",
        evidenceRefs: [outputEvidenceRef]
      })
    );
  } else {
    const content = readFileSync(outputFile, "utf8");
    if (content.trim().length === 0) {
      blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "output_file_empty",
          evidenceRefs: [outputEvidenceRef]
        })
      );
    }
    if (!edgePolicyProjectionOutput) {
      evaluateAdrOutputArtifact({
        manifest: input.manifest,
        outputFile,
        blockingReasonCarriers
      });
    }
    if (!edgePolicyProjectionOutput && sha256Text(content) !== report.digest) {
      blockingReasonCarriers.push(
        makeSdlcBlockingReason({
          code: "output_digest_mismatch",
          evidenceRefs: [outputEvidenceRef]
        })
      );
    }
  }
  evaluateMaterializedProductFiles({
    manifest: input.manifest,
    report,
    blockingReasonCarriers
  });
  evaluateDesignDepthFpEvaluatorTargetCarrier({
    manifest: input.manifest,
    blockingReasonCarriers,
    fpEvaluatorAdmissionEvidenceRefs:
      input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([])
  });
  evaluateComponentDepthTargetCarrier({
    manifest: input.manifest,
    blockingReasonCarriers
  });
  evaluateCodeBuilderSourceTestFrontier({
    manifest: input.manifest,
    blockingReasonCarriers
  });
  evaluateCodeBuilderValidationLogs({
    manifest: input.manifest,
    blockingReasonCarriers
  });
  const evidenceRefs = [
    pathToFileURL(input.manifest.outputFile).href,
    pathToFileURL(input.manifest.reportFile).href,
    pathToFileURL(input.manifest.productMaterialization.manifestFile).href,
    ...admittedDesignDepthFpEvaluatorRegisterEvidenceRefs(
      input.manifest,
      input.fpEvaluatorAdmissionEvidenceRefs ?? Object.freeze([])
    ),
    ...report.materializedFiles.map((file) =>
      pathToFileURL(file.absolutePath).href
    )
  ];
  evaluateExecutionEvidence({
    manifest: input.manifest,
    report,
    blockingReasonCarriers,
    evidenceRefs
  });
  if (!edgePolicyProjectionPending) {
    evaluateObligationAssessments({
      manifest: input.manifest,
      report,
      blockingReasonCarriers
    });
  }
  const activeBlockingReasonCarriers = activeComputeStageBlockingReasonCarriers({
    manifest: input.manifest,
    blockingReasonCarriers
  });
  return Object.freeze({
    kind: "sdlc_operator_postflight_result",
    status: activeBlockingReasonCarriers.length > 0 ? "blocked" : "passed",
    blockingReasons: Object.freeze(
      activeBlockingReasonCarriers.map((reason) =>
        legacyBlockingReasonCode(reason)
      )
    ),
    blockingReasonCarriers: Object.freeze(blockingReasonCarriers),
    evidenceRefs: Object.freeze(evidenceRefs)
  });
}

function evaluateDesignDepthFpEvaluatorTargetCarrier(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly blockingReasonCarriers: SdlcBlockingReason[];
  readonly fpEvaluatorAdmissionEvidenceRefs: readonly string[];
}): void {
  if (input.manifest.targetAssetType !== "implementation_design_surface") {
    return;
  }
  if (input.fpEvaluatorAdmissionEvidenceRefs.length === 0) {
    const ruleOutcomePath = join(
      input.manifest.archiveRoot,
      "design_depth_fp_evaluator_rule_outcome.json"
    );
    input.blockingReasonCarriers.push(
      makeSdlcBlockingReason({
        code: "design_depth_fp_evaluator_pending",
        detail: "design_depth_fp_evaluator_rule_outcome_missing",
        evidenceRefs: [pathToFileURL(ruleOutcomePath).href]
      })
    );
    return;
  }
  const admission = admitImplementationDesignRegisterForRuntimeEvaluation({
    manifest: input.manifest,
    fpEvaluatorAdmissionEvidenceRefs: input.fpEvaluatorAdmissionEvidenceRefs
  });
  if (admission.status === "admitted" && admission.register !== null) {
    return;
  }
  input.blockingReasonCarriers.push(
    makeSdlcBlockingReason({
      code: "design_depth_register_admission_invalid",
      detail:
        admission.blockingReasons.length === 0
          ? `design_depth_register_admission_${admission.status}`
          : admission.blockingReasons.join("; "),
      evidenceRefs: admission.evidenceRefs
    })
  );
}

function obligationAssessmentCounts(
  report: SdlcWorkerResultReport
): SdlcFpEvaluateResult["obligationAssessmentCounts"] {
  let fulfilled = 0;
  let partial = 0;
  let blocked = 0;
  let unassessed = 0;
  for (const assessment of report.obligationAssessments) {
    switch (assessment.fulfillmentStatus) {
      case "fulfilled":
        fulfilled += 1;
        break;
      case "partial":
        partial += 1;
        break;
      case "blocked":
        blocked += 1;
        break;
      case "unassessed":
        unassessed += 1;
        break;
      default: {
        const exhaustive: never = assessment.fulfillmentStatus;
        throw new TypeError(`Unsupported obligation status ${exhaustive}`);
      }
    }
  }
  return Object.freeze({
    total: report.obligationAssessments.length,
    fulfilled,
    partial,
    blocked,
    unassessed
  });
}

function fpEvaluateCloseDisposition(
  status: SdlcFpEvaluateResult["status"]
): GtlEvaluationCloseDispositionKind {
  switch (status) {
    case "passed":
      return "close_proposed";
    case "admitted_with_open_obligations":
      return "qualified_defer_proposed";
    case "blocked":
      return "block_proposed";
    default: {
      const exhaustive: never = status;
      throw new TypeError(`Unsupported F_P evaluate status ${exhaustive}`);
    }
  }
}

function fpEvaluatePressureRefs(input: {
  readonly runRef: string;
  readonly blockingReasons: readonly string[];
}): readonly string[] {
  return Object.freeze(
    input.blockingReasons.map(
      (reason) =>
        `pressure://odd-sdlc/fp-evaluate/${input.runRef}/${encodeURIComponent(reason)}`
    )
  );
}

export function sdlcFpEvaluateOpenObligationPressureRefs(input: {
  readonly runRef: string;
  readonly status: SdlcFpEvaluateResult["status"];
  readonly obligationAssessmentCounts: SdlcFpEvaluateResult["obligationAssessmentCounts"];
  readonly obligationAssessments?:
    | readonly Pick<
        SdlcWorkerObligationAssessment,
        "fulfillmentStatus" | "blockingReasons"
      >[]
	    | undefined;
}): readonly string[] {
  const effectiveCountsForAssessments = (
    assessments: readonly Pick<
      SdlcWorkerObligationAssessment,
      "fulfillmentStatus" | "blockingReasons"
    >[]
  ): SdlcFpEvaluateResult["obligationAssessmentCounts"] => {
    let fulfilled = 0;
    let partial = 0;
    let blocked = 0;
    let unassessed = 0;
    for (const assessment of assessments) {
      switch (assessment.fulfillmentStatus) {
        case "fulfilled":
          fulfilled += 1;
          break;
        case "partial":
          partial += 1;
          break;
        case "blocked":
          blocked += 1;
          break;
        case "unassessed":
          unassessed += 1;
          break;
      }
    }
    return Object.freeze({
      total: assessments.length,
      fulfilled,
      partial,
      blocked,
      unassessed
    });
  };
  const counts =
    input.obligationAssessments === undefined
      ? input.obligationAssessmentCounts
      : effectiveCountsForAssessments(input.obligationAssessments);
  const openAssessmentsAreDownstreamCarryover =
    counts.partial + counts.blocked > 0 &&
    input.obligationAssessments !== undefined &&
    input.obligationAssessments.filter(
      (assessment) =>
        assessment.fulfillmentStatus === "partial" ||
        assessment.fulfillmentStatus === "blocked"
    ).length ===
      counts.partial + counts.blocked &&
    input.obligationAssessments
      .filter((assessment) => assessment.fulfillmentStatus === "partial")
      .every((assessment) =>
        assessment.blockingReasons.some(
          (reason) =>
            reason.startsWith("requirement_recorded_for_future_closure:") ||
            reason.startsWith("requirement_carried_for_downstream_closure:")
        )
      ) &&
    input.obligationAssessments
      .filter((assessment) => assessment.fulfillmentStatus === "blocked")
      .every((assessment) =>
        assessment.blockingReasons.some((reason) =>
          reason.startsWith("requirement_carried_for_downstream_closure:")
        )
      );
  if (
    (input.status === "passed" ||
      (input.status === "admitted_with_open_obligations" &&
        openAssessmentsAreDownstreamCarryover)) &&
    counts.partial === 0 &&
    counts.blocked === 0 &&
    counts.unassessed === 0
  ) {
    return Object.freeze([]);
  }
  if (
    input.status === "admitted_with_open_obligations" &&
    openAssessmentsAreDownstreamCarryover &&
    counts.unassessed === 0
  ) {
    return Object.freeze([]);
  }
  const reasons = [
    ...(input.status === "passed" ? [] : [`status:${input.status}`]),
    ...(counts.partial === 0 || openAssessmentsAreDownstreamCarryover
      ? []
      : [`partial-${counts.partial}`]),
    ...(counts.blocked === 0 || openAssessmentsAreDownstreamCarryover
      ? []
      : [`blocked-${counts.blocked}`]),
    ...(counts.unassessed === 0 ? [] : [`unassessed-${counts.unassessed}`])
  ];
  return Object.freeze(
    uniqueSorted(reasons).map(
      (reason) =>
        `pressure://odd-sdlc/fp-evaluate/${input.runRef}/${encodeURIComponent(reason)}`
    )
  );
}

function constructGtlFpEvaluation(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly workerReportProjectionRef: string;
  readonly transformResultRef: string | null;
  readonly postflightRef: string;
  readonly status: SdlcFpEvaluateResult["status"];
  readonly postflight: SdlcPostflightResult;
  readonly counts: SdlcFpEvaluateResult["obligationAssessmentCounts"];
}): {
  readonly selectedComposition: SdlcFpEvaluateResult["selectedComposition"];
  readonly evaluationRef: string;
  readonly findings: readonly GtlEvaluationFindingRef[];
  readonly evaluation: GtlEvaluation;
} {
  const runRef = sdlcRunRefSegmentFromArchiveRoot(input.manifest.archiveRoot);
  const selectedComposition = input.selectedComposition;
  const evaluationRef = `evaluation://odd-sdlc/${runRef}/fp-evaluate`;
  const residualPressureRefs = fpEvaluatePressureRefs({
    runRef,
    blockingReasons: input.postflight.blockingReasons
  });
  const diagnosticRefs = Object.freeze([
    ...residualPressureRefs,
    `metrics://odd-sdlc/${runRef}/fp-evaluate/obligations`
  ]);
  const finding: GtlEvaluationFindingRef = Object.freeze({
    kind: "gtl_evaluation_finding_ref" as const,
    findingRef: `finding://odd-sdlc/${runRef}/fp-evaluate/1`,
    evaluatorRef: `evaluator://odd-sdlc/${runRef}/evaluate.C/postflight`,
    hookActionRef: null,
    gainReportRef: null,
    metricsRef: `metrics://odd-sdlc/${runRef}/fp-evaluate/obligations/${input.counts.fulfilled}-${input.counts.total}`,
    closeDisposition: fpEvaluateCloseDisposition(input.status),
    residualPressureRefs,
    continuationRefs: Object.freeze([
      `continuation://odd-sdlc/${runRef}/evaluate.C/${input.status}`
    ]),
    evidenceRefs: input.postflight.evidenceRefs,
    authorityRefs: uniqueSorted([
      input.workerReportProjectionRef,
      input.postflightRef,
      ...(input.transformResultRef === null ? [] : [input.transformResultRef]),
      ...input.postflight.evidenceRefs.filter((ref) =>
        ref.includes("design_depth_fp_evaluator_register.json") ||
        ref.includes("design_depth_fp_evaluator_content_register.json")
      )
    ]),
    compositionContributionRef:
      `composition-contribution://odd-sdlc/${runRef}/fp-evaluate/1`,
    compositionRef: selectedComposition.compositionRef,
    compositionDigest: selectedComposition.compositionDigest,
    diagnosticRefs
  });
  const findings = Object.freeze([finding]);
  return Object.freeze({
    selectedComposition,
    evaluationRef,
    findings,
    evaluation: Object.freeze({
      kind: "gtl_evaluation" as const,
      subjectRef: selectedComposition.compositionRef,
      candidateRef: input.workerReportProjectionRef,
      evaluationRef,
      findings,
      diagnosticRefs
    })
  });
}

function evaluateComputeSubworkstreamManifestPath(
  manifest: SdlcWorkerHandoffManifest
): string {
  return join(manifest.archiveRoot, SDLC_EVALUATE_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE);
}

function fpEvaluateResultPath(manifest: SdlcWorkerHandoffManifest): string {
  return manifest.fpEvaluateResultFile ?? join(manifest.archiveRoot, "fp_evaluate_result.json");
}

function evaluateComputeSubworkstreamManifest(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
}): SdlcFpEvaluateResult["subworkstreamManifest"] {
  const parentResultRef = pathToFileURL(fpEvaluateResultPath(input.manifest)).href;
  const manifestPath = evaluateComputeSubworkstreamManifestPath(input.manifest);
  if (!existsSync(manifestPath)) {
    return defaultComputeSubworkstreamManifest({
      manifest: input.manifest,
      stageRef: "evaluate.C",
      source: "system_default",
      parentResultRef
    });
  }
  return admitComputeSubworkstreamManifest({
    value: JSON.parse(readFileSync(manifestPath, "utf8")),
    manifest: input.manifest,
    stageRef: "evaluate.C",
    source: "parent_evaluate_report",
    parentResultRef
  });
}

export function constructSdlcFpEvaluateResult(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly report: SdlcWorkerResultReport;
  readonly postflight: SdlcPostflightResult;
  readonly postflightRef?: string | undefined;
}): SdlcFpEvaluateResult {
  const counts = obligationAssessmentCounts(input.report);
  const hasOpenObligations =
    counts.partial > 0 || counts.blocked > 0 || counts.unassessed > 0;
  const status =
    input.postflight.status === "blocked"
      ? "blocked"
      : hasOpenObligations
        ? "admitted_with_open_obligations"
        : "passed";
  const workerReportProjectionRef = pathToFileURL(input.manifest.reportFile).href;
  const transformResultRef =
    input.manifest.fpTransformRequest === null
      ? null
      : pathToFileURL(input.manifest.fpTransformResultFile).href;
  const postflightRef =
    input.postflightRef ??
    pathToFileURL(join(input.manifest.archiveRoot, "postflight.json")).href;
  const gtlEvaluation = constructGtlFpEvaluation({
    manifest: input.manifest,
    selectedComposition: input.selectedComposition,
    workerReportProjectionRef,
    transformResultRef,
    postflightRef,
    status,
    postflight: input.postflight,
    counts
  });
  const subworkstreamManifest = evaluateComputeSubworkstreamManifest({
    manifest: input.manifest
  });
  const subworkstreamManifestRef = pathToFileURL(
    evaluateComputeSubworkstreamManifestPath(input.manifest)
  ).href;
  return Object.freeze({
    kind: "sdlc_fp_evaluate_result" as const,
    stage: "F_P.evaluate" as const,
    computeNotationStage: "evaluate.C" as const,
    stageAuthority: "typed_fp_stage_carriers" as const,
    selectedComposition: gtlEvaluation.selectedComposition,
    compositionRef: gtlEvaluation.selectedComposition.compositionRef,
    compositionDigest: gtlEvaluation.selectedComposition.compositionDigest,
    compositionSelectionRef:
      gtlEvaluation.selectedComposition.compositionSelectionRef,
    selectedRegimeBindingRef:
      gtlEvaluation.selectedComposition.selectedRegimeBindingRef,
    workerReportProjectionRef,
    transformResultRef,
    postflightRef,
    evaluationRef: gtlEvaluation.evaluationRef,
    findings: gtlEvaluation.findings,
    evaluation: gtlEvaluation.evaluation,
    status,
    postflightStatus: input.postflight.status,
    blockingReasons: input.postflight.blockingReasons,
    evidenceRefs: input.postflight.evidenceRefs,
    subworkstreamManifestRef,
    subworkstreamManifest,
    subworkstreamCounts: computeSubworkstreamCounts(subworkstreamManifest),
    obligationAssessmentCounts: counts,
    executionEvidenceStatusSnapshot: input.report.executionEvidence?.status ?? null
  });
}

export function writeSdlcFpEvaluateResult(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly report: SdlcWorkerResultReport;
  readonly postflight: SdlcPostflightResult;
  readonly postflightRef?: string | undefined;
}): SdlcFpEvaluateResult {
  const result = constructSdlcFpEvaluateResult(input);
  const subworkstreamManifestPath = evaluateComputeSubworkstreamManifestPath(
    input.manifest
  );
  if (!existsSync(subworkstreamManifestPath)) {
    writeSdlcSystemArtifact({
      archiveRoot: input.manifest.archiveRoot,
      absolutePath: subworkstreamManifestPath,
      payload: result.subworkstreamManifest
    });
  }
  writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    absolutePath: fpEvaluateResultPath(input.manifest),
    payload: result
  });
  return result;
}
