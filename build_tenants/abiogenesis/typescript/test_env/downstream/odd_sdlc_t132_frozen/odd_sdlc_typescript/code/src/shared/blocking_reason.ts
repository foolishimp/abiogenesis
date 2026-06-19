import {
  parseClosedRecord,
  parseEnumValue,
  parseNonEmptyString,
  parseStringList
} from "./validation.js";

export const SDLC_BLOCKING_REASON_CODES = Object.freeze([
  "output_file_manifest_mismatch",
  "output_file_outside_allowed_root",
  "output_file_missing",
  "output_path_not_file",
  "output_file_empty",
  "output_digest_mismatch",
  "adr_output_filename_invalid",
  "adr_output_required_field_missing",
  "adr_output_status_invalid",
  "worker_report_unresolved_reasons_present",
  "worker_authority_read_outside_workspace",
  "worker_runtime_source_read",
  "unexpected_product_materialization_for_surface_edge",
  "materialized_product_file_is_output_artifact",
  "materialized_product_files_missing",
  "materialized_product_role_missing",
  "context_expected_files_not_materialization_authority",
  "materialized_product_role_policy_mismatch",
  "materialized_product_role_policy_ref_mismatch",
  "materialized_product_module_system_mismatch",
  "materialized_product_replay_role_policy_missing",
  "materialized_product_requirement_lineage_missing",
  "materialized_product_manifest_replay_kind_mismatch",
  "materialized_product_manifest_replay_target_mismatch",
  "materialized_product_manifest_replay_empty",
  "materialized_product_manifest_replay_parse_failed",
  "materialized_product_file_outside_tenant_root",
  "materialized_product_relative_path_absolute",
  "materialized_product_relative_path_mismatch",
  "materialized_product_file_missing",
  "materialized_product_path_not_file",
  "materialized_design_file_outside_design_root",
  "materialized_product_file_empty",
  "materialized_product_byte_count_mismatch",
  "materialized_product_digest_mismatch",
  "test_execution_evidence_missing",
  "test_execution_evidence_invalid",
  "test_execution_lane_mismatch",
  "test_execution_command_mismatch",
  "test_execution_evidence_contradiction",
  "test_execution_shard_evidence_missing",
  "test_execution_shard_evidence_mismatch",
  "test_execution_not_succeeded",
  "test_execution_zero_tests_observed",
  "test_execution_failures_present",
  "test_execution_report_refs_missing",
  "worker_execution_evidence_for_non_execution_edge",
  "test_materialization_not_discoverable",
  "worker_report_admission_failed",
  "silent_worker_inactivity",
  "worker_process_summary_missing",
  "worker_process_summary_invalid",
  "obligation_unassessed",
  "obligation_status_unassessed",
  "obligation_blocked_without_evidence",
  "obligation_assessment_extra",
  "obligation_payload_insufficient",
  "obligation_fulfilled_without_output_coverage",
  "review_grade_assessment_missing",
  "review_grade_assessment_invalid",
  "review_grade_edge_fulfillment_blocked",
  "design_depth_fp_evaluator_first_update_timeout",
  "design_depth_fp_evaluator_progress_timeout",
  "design_depth_fp_evaluator_process_failed",
  "design_depth_fp_evaluator_rule_blocked",
  "design_depth_fp_evaluator_pending",
  "design_depth_register_admission_invalid",
  "review_grade_evaluator_process_failed",
  "review_grade_evaluator_process_timeout",
  "review_grade_evaluator_mutated_input",
  "source_asset_dependency_missing",
  "edge_closure_residual_pressure",
  "hook_diagnostic_failed",
  "hook_diagnostic_missing",
  "installed_topology_invalid",
  "target_unavailable",
  "stale_query_domain",
  "target_carrier_admission_missing",
  "component_depth_register_admission_invalid",
  "tenant_stack_authority_missing",
  "tenant_stack_authority_invalid",
  "staged_authority_missing",
  "staged_authority_admission_invalid",
  "staged_decomposition_rejected",
  "staged_dependency_map_missing",
  "staged_dependency_traversal_blocked",
  "code_builder_parallel_frontier_missing",
  "code_builder_parallel_test_lanes_missing",
  "code_builder_validation_command_failed",
  "next_action_projection_graph_vector_missing",
  "legacy_graph_function_boundary_ref",
  "unknown_graph_function_boundary_ref",
  "legacy_graph_vector_boundary_ref",
  "unknown_graph_vector_boundary_ref",
  "post_materialization_graph_track_unresolved",
  "project_conformance_blocked",
  "unsupported_fd_transition",
  "project_conformance_gaps",
  "unsupported_transition",
  "fp_worker_unattached",
  "worker_output_limit_exceeded",
  "worker_rate_limited",
  "worker_connection_failed",
  "worker_process_failed",
  "worker_hard_timeout",
  "worker_executor_unavailable",
  "worker_launch_failed",
  "worker_process_error",
  "worker_lost_terminal",
  "install_failed",
  "abg_install_rejected",
  "command_binding_missing",
  "unknown_blocking_reason"
] as const);

export type SdlcBlockingReasonCode =
  (typeof SDLC_BLOCKING_REASON_CODES)[number];

export const SDLC_BLOCKING_REASON_CLASSES = Object.freeze([
  "contract_violation",
  "authority_to_code",
  "code_to_test",
  "missing_evidence",
  "worker_unresolved",
  "topology",
  "target_resolution",
  "worker_runtime",
  "runtime_policy",
  "install",
  "assurance",
  "unknown"
] as const);

export type SdlcBlockingReasonClass =
  (typeof SDLC_BLOCKING_REASON_CLASSES)[number];

export const SDLC_BLOCKING_REASON_REENTRY_POINTS = Object.freeze([
  "same_edge_retry",
  "escalate_to_fp",
  "repair_worker_output",
  "attach_worker",
  "repair_installed_topology",
  "fix_target_or_run_gaps",
  "repair_project_conformance",
  "reprice_runtime_policy",
  "reprice_requirement_or_design",
  "triage_gap",
  "rerun_start",
  "inspect_worker_archive",
  "repair_install",
  "operator_blocked"
] as const);

export type SdlcBlockingReasonLawfulReentryPoint =
  (typeof SDLC_BLOCKING_REASON_REENTRY_POINTS)[number];

export const SDLC_FD_FAILURE_SEVERITY_CLASSES = Object.freeze([
  "protocol_invalid",
  "construction_context_invalid",
  "diagnostic_shape_invalid",
  "content_unproven"
] as const);

export type SdlcFdFailureSeverityClass =
  (typeof SDLC_FD_FAILURE_SEVERITY_CLASSES)[number];

export type SdlcDownstreamReadStatus =
  | "consumed_by_downstream"
  | "not_consumed_by_downstream"
  | "not_applicable";

export interface SdlcFdFailureClassification {
  readonly kind: "sdlc_fd_failure_classification";
  readonly severityClass: SdlcFdFailureSeverityClass;
  readonly downstreamReadStatus: SdlcDownstreamReadStatus;
  readonly blocksAdmission: boolean;
  readonly blocksConstruction: boolean;
  readonly recordsResidualPressure: boolean;
  readonly routesToFpOrExecution: boolean;
}

const DETAIL_PRESERVING_LEGACY_REASON_CODES = Object.freeze([
  "materialized_product_role_missing",
  "materialized_product_module_system_mismatch",
  "component_depth_register_admission_invalid",
  "adr_output_filename_invalid",
  "adr_output_required_field_missing",
  "adr_output_status_invalid",
  "worker_report_admission_failed",
  "worker_authority_read_outside_workspace",
  "worker_runtime_source_read",
  "test_execution_lane_mismatch",
  "test_execution_command_mismatch",
  "test_execution_evidence_invalid",
  "test_execution_evidence_contradiction",
  "test_execution_shard_evidence_missing",
  "test_execution_shard_evidence_mismatch",
  "test_execution_not_succeeded",
  "test_execution_failures_present",
  "worker_execution_evidence_for_non_execution_edge",
  "silent_worker_inactivity",
  "worker_process_summary_missing",
  "worker_process_summary_invalid",
  "obligation_unassessed",
  "obligation_status_unassessed",
  "obligation_blocked_without_evidence",
  "obligation_assessment_extra",
  "obligation_payload_insufficient",
  "obligation_fulfilled_without_output_coverage",
  "review_grade_assessment_missing",
  "review_grade_assessment_invalid",
  "review_grade_edge_fulfillment_blocked",
  "design_depth_fp_evaluator_first_update_timeout",
  "design_depth_fp_evaluator_progress_timeout",
  "design_depth_fp_evaluator_process_failed",
  "design_depth_fp_evaluator_rule_blocked",
  "design_depth_fp_evaluator_pending",
  "design_depth_register_admission_invalid",
  "review_grade_evaluator_process_failed",
  "review_grade_evaluator_process_timeout",
  "review_grade_evaluator_mutated_input",
  "source_asset_dependency_missing",
  "unsupported_fd_transition",
  "unsupported_transition",
  "unknown_blocking_reason"
] as const satisfies readonly SdlcBlockingReasonCode[]);

const DETAIL_PRESERVING_LEGACY_REASON_CODE_SET: ReadonlySet<SdlcBlockingReasonCode> =
  new Set(DETAIL_PRESERVING_LEGACY_REASON_CODES);

function preservesLegacyReasonDetail(code: SdlcBlockingReasonCode): boolean {
  return DETAIL_PRESERVING_LEGACY_REASON_CODE_SET.has(code);
}

export interface SdlcBlockingReason {
  readonly kind: "sdlc_blocking_reason";
  readonly code: SdlcBlockingReasonCode;
  readonly reasonClass: SdlcBlockingReasonClass;
  readonly lawfulReentryPoint: SdlcBlockingReasonLawfulReentryPoint;
  readonly message: string;
  readonly detail: string | null;
  readonly evidenceRefs: readonly string[];
}

interface BlockingReasonMetadata {
  readonly reasonClass: SdlcBlockingReasonClass;
  readonly lawfulReentryPoint: SdlcBlockingReasonLawfulReentryPoint;
  readonly message: string;
}

function metadataForCode(code: SdlcBlockingReasonCode): BlockingReasonMetadata {
  if (
    code.startsWith("output_") ||
    code.includes("relative_path") ||
    code.includes("digest") ||
    code.includes("byte_count") ||
    code.includes("path_not_file") ||
    code.startsWith("adr_output_") ||
    code === "materialized_product_file_is_output_artifact" ||
    code === "materialized_design_file_outside_design_root" ||
    code === "unexpected_product_materialization_for_surface_edge"
  ) {
    return Object.freeze({
      reasonClass: "contract_violation",
      lawfulReentryPoint: "repair_worker_output",
      message: "Worker output violated the declared handoff contract."
    });
  }
  if (code === "component_depth_register_admission_invalid") {
    return Object.freeze({
      reasonClass: "contract_violation",
      lawfulReentryPoint: "same_edge_retry",
      message:
        "Component-depth target carrier could not be admitted as a closed typed carrier."
    });
  }
  if (
    code === "materialized_product_manifest_replay_kind_mismatch" ||
    code === "materialized_product_manifest_replay_target_mismatch" ||
    code === "materialized_product_manifest_replay_empty" ||
    code === "materialized_product_manifest_replay_parse_failed" ||
    code === "materialized_product_replay_role_policy_missing"
  ) {
    return Object.freeze({
      reasonClass:
        code === "materialized_product_manifest_replay_empty"
          ? "missing_evidence"
          : "authority_to_code",
      lawfulReentryPoint: "same_edge_retry",
      message: "Product materialization replay evidence could not be admitted."
    });
  }
  if (code.startsWith("materialized_product_")) {
    return Object.freeze({
      reasonClass: code.includes("missing") || code.includes("empty")
        ? "missing_evidence"
        : "authority_to_code",
      lawfulReentryPoint: "same_edge_retry",
      message: "Materialized product evidence does not satisfy the product contract."
    });
  }
  if (code === "context_expected_files_not_materialization_authority") {
    return Object.freeze({
      reasonClass: "authority_to_code",
      lawfulReentryPoint: "same_edge_retry",
      message: "Context expected-file observations are not materialization authority."
    });
  }
  if (code.startsWith("test_execution_")) {
    if (code === "test_execution_evidence_invalid") {
      return Object.freeze({
        reasonClass: "contract_violation",
        lawfulReentryPoint: "repair_worker_output",
        message:
          "Governed test execution evidence could not be admitted as a typed carrier."
      });
    }
    if (code === "test_execution_evidence_contradiction") {
      return Object.freeze({
        reasonClass: "code_to_test",
        lawfulReentryPoint: "triage_gap",
        message:
          "Governed test execution evidence is internally contradictory and requires triage."
      });
    }
    return Object.freeze({
      reasonClass: "code_to_test",
      lawfulReentryPoint: "same_edge_retry",
      message: "Governed test execution evidence does not satisfy the traversal contract."
    });
  }
  if (code === "worker_execution_evidence_for_non_execution_edge") {
    return Object.freeze({
      reasonClass: "authority_to_code",
      lawfulReentryPoint: "same_edge_retry",
      message:
        "Worker transform artifact carried typed execution evidence for an edge whose execution evidence is evaluator-owned downstream."
    });
  }
  if (code === "worker_report_unresolved_reasons_present") {
    return Object.freeze({
      reasonClass: "worker_unresolved",
      lawfulReentryPoint: "same_edge_retry",
      message: "The worker report carried unresolved reasons."
    });
  }
  if (code === "worker_report_admission_failed") {
    return Object.freeze({
      reasonClass: "contract_violation",
      lawfulReentryPoint: "repair_worker_output",
      message: "The worker report could not be admitted as a closed carrier."
    });
  }
  if (code === "worker_authority_read_outside_workspace") {
    return Object.freeze({
      reasonClass: "authority_to_code",
      lawfulReentryPoint: "same_edge_retry",
      message:
        "Worker consumed readable state outside the active workspace authority boundary."
    });
  }
  if (code === "worker_runtime_source_read") {
    return Object.freeze({
      reasonClass: "authority_to_code",
      lawfulReentryPoint: "same_edge_retry",
      message:
        "Worker consumed installed runtime source instead of project authority surfaces."
    });
  }
  if (code === "design_depth_fp_evaluator_first_update_timeout") {
    return Object.freeze({
      reasonClass: "assurance",
      lawfulReentryPoint: "same_edge_retry",
      message:
        "F_P design-depth evaluator timed out before publishing a first semantic content-register update."
    });
  }
  if (code === "design_depth_fp_evaluator_progress_timeout") {
    return Object.freeze({
      reasonClass: "assurance",
      lawfulReentryPoint: "same_edge_retry",
      message:
        "F_P design-depth evaluator timed out after publishing semantic content-register progress."
    });
  }
  if (code === "design_depth_fp_evaluator_pending") {
    return Object.freeze({
      reasonClass: "assurance",
      lawfulReentryPoint: "operator_blocked",
      message:
        "F_P design-depth evaluator must admit the design-depth target carrier before closure."
    });
  }
  if (code === "design_depth_register_admission_invalid") {
    return Object.freeze({
      reasonClass: "contract_violation",
      lawfulReentryPoint: "triage_gap",
      message:
        "Design-depth evaluator target carrier could not be admitted as a closed typed carrier."
    });
  }
  if (
    code === "design_depth_fp_evaluator_process_failed" ||
    code === "design_depth_fp_evaluator_rule_blocked" ||
    code === "review_grade_assessment_missing" ||
    code === "review_grade_assessment_invalid" ||
    code === "review_grade_evaluator_process_failed" ||
    code === "review_grade_evaluator_process_timeout" ||
    code === "review_grade_evaluator_mutated_input"
  ) {
    return Object.freeze({
      reasonClass: "assurance",
      lawfulReentryPoint: "triage_gap",
      message:
        "F_P evaluator process or rule admission failed and requires operator triage."
    });
  }
  if (
    code === "obligation_unassessed" ||
    code === "obligation_status_unassessed" ||
    code === "obligation_blocked_without_evidence" ||
    code === "obligation_assessment_extra" ||
    code === "obligation_payload_insufficient" ||
    code === "obligation_fulfilled_without_output_coverage" ||
    code === "review_grade_edge_fulfillment_blocked" ||
    code === "source_asset_dependency_missing"
  ) {
    return Object.freeze({
      reasonClass: "assurance",
      lawfulReentryPoint:
        code === "obligation_blocked_without_evidence" ||
        code === "obligation_assessment_extra"
          ? "repair_worker_output"
          : "same_edge_retry",
      message: "Worker obligation assessment does not satisfy traversal pressure."
    });
  }
  if (code === "edge_closure_residual_pressure") {
    return Object.freeze({
      reasonClass: "assurance",
      lawfulReentryPoint: "same_edge_retry",
      message: "Edge closure residual pressure requires same-edge repair."
    });
  }
  if (code === "hook_diagnostic_failed" || code === "hook_diagnostic_missing") {
    return Object.freeze({
      reasonClass: "contract_violation",
      lawfulReentryPoint: "same_edge_retry",
      message: "Hook diagnostic did not admit the generated result."
    });
  }
  if (
    code === "installed_topology_invalid" ||
    code === "project_conformance_blocked" ||
    code === "project_conformance_gaps"
  ) {
    return Object.freeze({
      reasonClass: "topology",
      lawfulReentryPoint:
        code === "installed_topology_invalid"
          ? "repair_installed_topology"
          : "repair_project_conformance",
      message: "Project or install topology is not ready for downstream traversal."
    });
  }
  if (code === "target_carrier_admission_missing") {
    return Object.freeze({
      reasonClass: "contract_violation",
      lawfulReentryPoint: "same_edge_retry",
      message:
        "Target carrier envelope evidence is missing for the selected contract."
    });
  }
  if (code === "staged_authority_admission_invalid") {
    return Object.freeze({
      reasonClass: "contract_violation",
      lawfulReentryPoint: "repair_worker_output",
      message:
        "Staged construction authority carrier could not be admitted as a closed typed carrier."
    });
  }
  if (code.startsWith("tenant_stack_")) {
    return Object.freeze({
      reasonClass: "authority_to_code",
      lawfulReentryPoint: "reprice_requirement_or_design",
      message:
        "Tenant technology-stack authority is missing or invalid for executable materialization."
    });
  }
  if (code.startsWith("staged_")) {
    return Object.freeze({
      reasonClass: "topology",
      lawfulReentryPoint: "reprice_requirement_or_design",
      message:
        "Staged construction authority does not admit the downstream materialization edge."
    });
  }
  if (code.startsWith("code_builder_")) {
    return Object.freeze({
      reasonClass: code === "code_builder_validation_command_failed"
        ? "code_to_test"
        : "topology",
      lawfulReentryPoint: "same_edge_retry",
      message:
        "Code-builder source/test frontier evidence is incomplete for the selected traversal."
    });
  }
  if (
    code === "target_unavailable" ||
    code === "stale_query_domain" ||
    code === "next_action_projection_graph_vector_missing" ||
    code === "legacy_graph_function_boundary_ref" ||
    code === "unknown_graph_function_boundary_ref" ||
    code === "legacy_graph_vector_boundary_ref" ||
    code === "unknown_graph_vector_boundary_ref" ||
    code === "post_materialization_graph_track_unresolved"
  ) {
    return Object.freeze({
      reasonClass: "target_resolution",
      lawfulReentryPoint: "fix_target_or_run_gaps",
      message: "Requested traversal target is not available from current projection truth."
    });
  }
  if (code === "unsupported_fd_transition" || code === "unsupported_transition") {
    return Object.freeze({
      reasonClass: "runtime_policy",
      lawfulReentryPoint: "reprice_runtime_policy",
      message: "Runtime transition is not supported by the installed operator."
    });
  }
  if (code === "fp_worker_unattached") {
    return Object.freeze({
      reasonClass: "worker_runtime",
      lawfulReentryPoint: "attach_worker",
      message: "F_P traversal requires an attached worker transport."
    });
  }
  if (code === "silent_worker_inactivity") {
    return Object.freeze({
      reasonClass: "worker_runtime",
      lawfulReentryPoint: "inspect_worker_archive",
      message: "Worker process timed out without observable transform progress."
    });
  }
  if (code === "worker_process_summary_missing") {
    return Object.freeze({
      reasonClass: "missing_evidence",
      lawfulReentryPoint: "inspect_worker_archive",
      message: "Worker process summary evidence is missing from the archive."
    });
  }
  if (code === "worker_process_summary_invalid") {
    return Object.freeze({
      reasonClass: "contract_violation",
      lawfulReentryPoint: "inspect_worker_archive",
      message: "Worker process summary evidence could not be admitted."
    });
  }
  if (code === "worker_rate_limited") {
    return Object.freeze({
      reasonClass: "worker_runtime",
      lawfulReentryPoint: "triage_gap",
      message:
        "Worker provider rate limit or quota exhaustion is runtime backpressure and must stop automatic retry."
    });
  }
  if (code === "worker_output_limit_exceeded") {
    return Object.freeze({
      reasonClass: "worker_runtime",
      lawfulReentryPoint: "same_edge_retry",
      message: "Worker response exceeded the provider or executor output limit before the artifact was admitted."
    });
  }
  if (code === "worker_connection_failed") {
    return Object.freeze({
      reasonClass: "worker_runtime",
      lawfulReentryPoint: "same_edge_retry",
      message: "Worker provider connection failed before the artifact was admitted."
    });
  }
  if (code === "worker_process_failed") {
    return Object.freeze({
      reasonClass: "worker_runtime",
      lawfulReentryPoint: "inspect_worker_archive",
      message: "Worker process exited unsuccessfully."
    });
  }
  if (
    code === "worker_hard_timeout" ||
    code === "worker_executor_unavailable" ||
    code === "worker_launch_failed" ||
    code === "worker_process_error" ||
    code === "worker_lost_terminal"
  ) {
    return Object.freeze({
      reasonClass: "worker_runtime",
      lawfulReentryPoint: "inspect_worker_archive",
      message: "Worker process failed with typed ABG process outcome evidence."
    });
  }
  if (
    code === "install_failed" ||
    code === "abg_install_rejected" ||
    code === "command_binding_missing"
  ) {
    return Object.freeze({
      reasonClass: "install",
      lawfulReentryPoint: "repair_install",
      message: "Product installation did not complete."
    });
  }
  return Object.freeze({
    reasonClass: "unknown",
    lawfulReentryPoint: "operator_blocked",
    message: "Blocking reason was not recognized by the closed carrier catalog."
  });
}

function severityClassForBlockingReason(
  reason: SdlcBlockingReason
): SdlcFdFailureSeverityClass {
  if (
    reason.code === "test_execution_evidence_missing" ||
    reason.code === "test_execution_not_succeeded" ||
    reason.code === "test_execution_zero_tests_observed" ||
    reason.code === "test_execution_failures_present" ||
    reason.reasonClass === "code_to_test" ||
    reason.reasonClass === "assurance" ||
    reason.reasonClass === "worker_unresolved" ||
    reason.reasonClass === "missing_evidence"
  ) {
    return "content_unproven";
  }
  if (
    reason.reasonClass === "topology" ||
    reason.reasonClass === "target_resolution" ||
    reason.reasonClass === "runtime_policy" ||
    reason.reasonClass === "worker_runtime" ||
    reason.reasonClass === "install"
  ) {
    return "construction_context_invalid";
  }
  return "protocol_invalid";
}

export function classifySdlcFdFailure(input: {
  readonly reason: SdlcBlockingReason;
  readonly downstreamRead?: boolean | null;
}): SdlcFdFailureClassification {
  const downstreamReadStatus: SdlcDownstreamReadStatus =
    input.downstreamRead === true
      ? "consumed_by_downstream"
      : input.downstreamRead === false
        ? "not_consumed_by_downstream"
        : "not_applicable";
  if (input.downstreamRead === false) {
    return Object.freeze({
      kind: "sdlc_fd_failure_classification" as const,
      severityClass: "diagnostic_shape_invalid" as const,
      downstreamReadStatus,
      blocksAdmission: false,
      blocksConstruction: false,
      recordsResidualPressure: true,
      routesToFpOrExecution: false
    });
  }
  const severityClass = severityClassForBlockingReason(input.reason);
  return Object.freeze({
    kind: "sdlc_fd_failure_classification" as const,
    severityClass,
    downstreamReadStatus,
    blocksAdmission: severityClass === "protocol_invalid",
    blocksConstruction: severityClass === "construction_context_invalid",
    recordsResidualPressure: true,
    routesToFpOrExecution: severityClass === "content_unproven"
  });
}

export function makeSdlcBlockingReason(input: {
  readonly code: SdlcBlockingReasonCode;
  readonly detail?: string | null;
  readonly evidenceRefs?: readonly string[];
  readonly message?: string | undefined;
  readonly lawfulReentryPoint?: SdlcBlockingReasonLawfulReentryPoint | undefined;
  readonly reasonClass?: SdlcBlockingReasonClass | undefined;
}): SdlcBlockingReason {
  const metadata = metadataForCode(input.code);
  return Object.freeze({
    kind: "sdlc_blocking_reason" as const,
    code: input.code,
    reasonClass: input.reasonClass ?? metadata.reasonClass,
    lawfulReentryPoint: input.lawfulReentryPoint ?? metadata.lawfulReentryPoint,
    message: input.message ?? metadata.message,
    detail: input.detail ?? null,
    evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])])
  });
}

export function legacyBlockingReasonCode(reason: SdlcBlockingReason): string {
  if (reason.detail === null) {
    return reason.code;
  }
  if (preservesLegacyReasonDetail(reason.code)) {
    return `${reason.code}:${reason.detail}`;
  }
  if (reason.code === "hook_diagnostic_failed") {
    return `hook_diagnostic:${reason.detail}`;
  }
  if (reason.code === "hook_diagnostic_missing") {
    return "hook_diagnostic:hook_diagnostic_missing";
  }
  if (reason.code === "edge_closure_residual_pressure") {
    return reason.detail;
  }
  return reason.code;
}

export function summarizeBlockingReasons(
  reasons: readonly SdlcBlockingReason[]
): string | null {
  if (reasons.length === 0) {
    return null;
  }
  return reasons.map(legacyBlockingReasonCode).join(",");
}

export function canonicalSdlcPriorGapReasonCode(reason: string): string {
  const prefixes = Object.freeze([
    "obligation_assessment_open:prior_gap:",
    "obligation_assessment_missing:prior_gap:",
    "obligation_assessment_blocked:prior_gap:",
    "dropped_prior_obligation:",
    "prior_gap:"
  ]);
  let current = reason;
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of prefixes) {
      if (current.startsWith(prefix)) {
        current = current.slice(prefix.length);
        changed = true;
      }
    }
  }
  return current;
}

function splitKnownPrefix(raw: string, prefix: string): string | null {
  return raw.startsWith(`${prefix}:`) ? raw.slice(prefix.length + 1) : null;
}

export function sdlcBlockingReasonFromLegacy(input: {
  readonly reason: string;
  readonly evidenceRefs?: readonly string[];
}): SdlcBlockingReason {
  const evidenceRefs = input.evidenceRefs ?? Object.freeze([]);
  const known = SDLC_BLOCKING_REASON_CODES.find((code) => code === input.reason);
  if (known !== undefined) {
    return makeSdlcBlockingReason({
      code: known,
      evidenceRefs
    });
  }
  const role = splitKnownPrefix(input.reason, "materialized_product_role_missing");
  if (role !== null) {
    return makeSdlcBlockingReason({
      code: "materialized_product_role_missing",
      detail: role,
      evidenceRefs
    });
  }
  const workerReport = splitKnownPrefix(
    input.reason,
    "worker_report_admission_failed"
  );
  if (workerReport !== null) {
    return makeSdlcBlockingReason({
      code: "worker_report_admission_failed",
      detail: workerReport,
      evidenceRefs
    });
  }
  for (const code of DETAIL_PRESERVING_LEGACY_REASON_CODES) {
    const detail = splitKnownPrefix(input.reason, code);
    if (detail !== null) {
      return makeSdlcBlockingReason({
        code,
        detail,
        evidenceRefs
      });
    }
  }
  const obligationUnassessed = splitKnownPrefix(input.reason, "obligation_unassessed");
  if (obligationUnassessed !== null) {
    return makeSdlcBlockingReason({
      code: "obligation_unassessed",
      detail: obligationUnassessed,
      evidenceRefs
    });
  }
  const obligationStatusUnassessed = splitKnownPrefix(
    input.reason,
    "obligation_status_unassessed"
  );
  if (obligationStatusUnassessed !== null) {
    return makeSdlcBlockingReason({
      code: "obligation_status_unassessed",
      detail: obligationStatusUnassessed,
      evidenceRefs
    });
  }
  const obligationBlockedWithoutEvidence = splitKnownPrefix(
    input.reason,
    "obligation_blocked_without_evidence"
  );
  if (obligationBlockedWithoutEvidence !== null) {
    return makeSdlcBlockingReason({
      code: "obligation_blocked_without_evidence",
      detail: obligationBlockedWithoutEvidence,
      evidenceRefs
    });
  }
  const obligationAssessmentExtra = splitKnownPrefix(
    input.reason,
    "obligation_assessment_extra"
  );
  if (obligationAssessmentExtra !== null) {
    return makeSdlcBlockingReason({
      code: "obligation_assessment_extra",
      detail: obligationAssessmentExtra,
      evidenceRefs
    });
  }
  const obligationPayloadInsufficient = splitKnownPrefix(
    input.reason,
    "obligation_payload_insufficient"
  );
  if (obligationPayloadInsufficient !== null) {
    return makeSdlcBlockingReason({
      code: "obligation_payload_insufficient",
      detail: obligationPayloadInsufficient,
      evidenceRefs
    });
  }
  const obligationFulfilledWithoutOutputCoverage = splitKnownPrefix(
    input.reason,
    "obligation_fulfilled_without_output_coverage"
  );
  if (obligationFulfilledWithoutOutputCoverage !== null) {
    return makeSdlcBlockingReason({
      code: "obligation_fulfilled_without_output_coverage",
      detail: obligationFulfilledWithoutOutputCoverage,
      evidenceRefs
    });
  }
  const hookDiagnostic = splitKnownPrefix(input.reason, "hook_diagnostic");
  if (hookDiagnostic !== null) {
    return makeSdlcBlockingReason({
      code:
        hookDiagnostic === "hook_diagnostic_missing"
          ? "hook_diagnostic_missing"
          : "hook_diagnostic_failed",
      detail: hookDiagnostic,
      evidenceRefs
    });
  }
  const fdTransition = splitKnownPrefix(input.reason, "unsupported_fd_transition");
  if (fdTransition !== null) {
    return makeSdlcBlockingReason({
      code: "unsupported_fd_transition",
      detail: fdTransition,
      evidenceRefs
    });
  }
  const transition = splitKnownPrefix(input.reason, "unsupported_transition");
  if (transition !== null) {
    return makeSdlcBlockingReason({
      code: "unsupported_transition",
      detail: transition,
      evidenceRefs
    });
  }
  return makeSdlcBlockingReason({
    code: "unknown_blocking_reason",
    detail: input.reason,
    evidenceRefs
  });
}

export function admitSdlcBlockingReason(
  input: unknown,
  label = "SdlcBlockingReason"
): SdlcBlockingReason {
  const record = parseClosedRecord(input, label, [
    "kind",
    "code",
    "reasonClass",
    "lawfulReentryPoint",
    "message",
    "detail",
    "evidenceRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_blocking_reason") {
    throw new TypeError(`${label}.kind: unexpected blocking reason kind`);
  }
  const detail =
    record["detail"] === null
      ? null
      : parseNonEmptyString(record["detail"], `${label}.detail`);
  return Object.freeze({
    kind: "sdlc_blocking_reason",
    code: parseEnumValue(
      record["code"],
      `${label}.code`,
      SDLC_BLOCKING_REASON_CODES
    ),
    reasonClass: parseEnumValue(
      record["reasonClass"],
      `${label}.reasonClass`,
      SDLC_BLOCKING_REASON_CLASSES
    ),
    lawfulReentryPoint: parseEnumValue(
      record["lawfulReentryPoint"],
      `${label}.lawfulReentryPoint`,
      SDLC_BLOCKING_REASON_REENTRY_POINTS
    ),
    message: parseNonEmptyString(record["message"], `${label}.message`),
    detail,
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}
