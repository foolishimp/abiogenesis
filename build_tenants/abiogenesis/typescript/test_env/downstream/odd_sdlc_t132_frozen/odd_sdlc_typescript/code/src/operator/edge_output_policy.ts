// Implements: T-184

import type {
  SdlcMaterializedProductFileRole,
  SdlcWorkerHandoffManifest
} from "./carriers.js";

export type SdlcEdgeOutputProducer =
  | "worker_transform"
  | "system_projection";

export interface SdlcEdgeOutputPolicy {
  readonly kind: "sdlc_edge_output_policy";
  readonly targetAssetType: string;
  readonly outputProducer: SdlcEdgeOutputProducer;
  readonly workerAuthoredTargetCarrierProtocolRequired: boolean;
  readonly reviewGradeAssessmentExempt: boolean;
  readonly admitsTestExecutionEvidence: boolean;
  readonly materializationRoles: readonly SdlcMaterializedProductFileRole[];
}

const SYSTEM_PROJECTED_TARGETS = Object.freeze(
  new Set<string>([
    "component_realization_qualification_surface",
    "code_surface",
    "test_execution_surface",
    "test_execution_result_surface",
    "component_test_qualification_surface",
    "test_run_archive_surface",
    "release_depth_parity_surface",
    "release_surface"
  ])
);

const WORKER_AUTHORED_TARGET_CARRIER_TARGETS = Object.freeze(
  new Set<string>([
    "component_code_surface",
    "component_test_surface",
    "uat_test_source_surface",
    "test_design_surface",
    "component_repair_schedule_surface"
  ])
);

const REVIEW_GRADE_EXEMPT_TARGETS = Object.freeze(
  new Set<string>([
    "intent_surface",
    "product_surface",
    "goal_surface",
    "requirement_surface",
    "uat_testcases_surface",
    "testcase_authority_surface",
    "feature_decomp_surface",
    "design_surface",
    "scenario_surface",
    "implementation_design_surface",
    "code_surface",
    ...SYSTEM_PROJECTED_TARGETS
  ])
);

export function sdlcEdgeOutputPolicyForTargetAssetType(
  targetAssetType: string
): SdlcEdgeOutputPolicy {
  const outputProducer: SdlcEdgeOutputProducer = SYSTEM_PROJECTED_TARGETS.has(
    targetAssetType
  )
    ? "system_projection"
    : "worker_transform";
  const materializationRoles: readonly SdlcMaterializedProductFileRole[] =
    targetAssetType === "component_code_surface"
      ? Object.freeze(["source" as const])
      : targetAssetType === "component_test_surface" ||
          targetAssetType === "uat_test_source_surface"
        ? Object.freeze(["test" as const])
        : Object.freeze([]);
  return Object.freeze({
    kind: "sdlc_edge_output_policy" as const,
    targetAssetType,
    outputProducer,
    workerAuthoredTargetCarrierProtocolRequired:
      outputProducer === "worker_transform" &&
      WORKER_AUTHORED_TARGET_CARRIER_TARGETS.has(targetAssetType),
    reviewGradeAssessmentExempt: REVIEW_GRADE_EXEMPT_TARGETS.has(targetAssetType),
    admitsTestExecutionEvidence: targetAssetType === "test_execution_result_surface",
    materializationRoles
  });
}

export function sdlcInstalledOperatorProjectsOutput(
  targetAssetType: string
): boolean {
  return (
    sdlcEdgeOutputPolicyForTargetAssetType(targetAssetType).outputProducer ===
    "system_projection"
  );
}

export function sdlcReviewGradeEdgeFulfillmentAssessmentRequired(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  const policy = sdlcEdgeOutputPolicyForTargetAssetType(manifest.targetAssetType);
  return (
    manifest.fpTransformRequest !== null &&
    !policy.reviewGradeAssessmentExempt &&
    manifest.outputFile.trim().length > 0 &&
    manifest.traversalObligationContext.obligations.length > 0
  );
}
