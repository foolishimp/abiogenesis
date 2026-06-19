// Implements: T-175

export type SdlcOperatorRunArtifactRole =
  | "runtime_fact"
  | "authority_admission"
  | "worker_projection"
  | "read_model"
  | "forensic_payload";

export type SdlcOperatorRunArtifactSourceOwner =
  | "abg_runtime"
  | "consequence_projection"
  | "fp_evaluator"
  | "installed_operator"
  | "handoff_projection"
  | "worker_process"
  | "analysis_projection"
  | "staged_construction_admission";

export type SdlcOperatorRunArtifactRequiredWhen =
  | "parallel_dependency_traversal_selected"
  | "closed_product_edge_requires_materialization_manifest"
  | "implementation_design_surface_present"
  | "review_grade_edge_fulfillment_required";

export interface SdlcOperatorRunArtifactRow {
  readonly artifactRef: string;
  readonly relativePath: string;
  readonly carrierKind: string | null;
  readonly role: SdlcOperatorRunArtifactRole;
  readonly sourceOwner: SdlcOperatorRunArtifactSourceOwner;
  readonly requiredForPresentEdge: boolean;
  readonly requiredWhen?: SdlcOperatorRunArtifactRequiredWhen | undefined;
  readonly malformedGapTracked: boolean;
  readonly admissionRef: string | null;
}

export interface SdlcOperatorRunArtifactRequirednessContext {
  readonly edgeRef: string | null;
  readonly targetAssetType: string | null;
  readonly closureDisposition: string | null;
  readonly selectedDependencyTraversalMethods: readonly string[];
  readonly productGraphRequiredArtifactRefs: readonly string[];
}

function row(input: SdlcOperatorRunArtifactRow): SdlcOperatorRunArtifactRow {
  return Object.freeze(input);
}

export const SDLC_OPERATOR_RUN_ARTIFACT_CATALOG = Object.freeze([
  row({
    artifactRef: "operator-run-artifact://operator-summary",
    relativePath: "operator_summary.json",
    carrierKind: "sdlc_operator_summary",
    role: "read_model",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/operator-summary"
  }),
  row({
    artifactRef: "operator-run-artifact://run",
    relativePath: "run.json",
    carrierKind: "sdlc_installed_operator_start_outcome",
    role: "read_model",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/run"
  }),
  row({
    artifactRef: "operator-run-artifact://run-compact",
    relativePath: "run_compact.json",
    carrierKind: "sdlc_installed_operator_run_compact",
    role: "read_model",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/run-compact"
  }),
  row({
    artifactRef: "operator-run-artifact://managed-traversal-manifest",
    relativePath: "managed_traversal_manifest.json",
    carrierKind: null,
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/managed-traversal-manifest"
  }),
  row({
    artifactRef: "operator-run-artifact://conform-project-report",
    relativePath: "conform_project_report.json",
    carrierKind: null,
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/conform-project-report"
  }),
  row({
    artifactRef: "operator-run-artifact://traversal-intent-package",
    relativePath: "traversal_intent_package.json",
    carrierKind: "sdlc_traversal_intent_package",
    role: "authority_admission",
    sourceOwner: "handoff_projection",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/traversal-intent-package"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-run",
    relativePath: "worker_run.json",
    carrierKind: "sdlc_worker_run_result",
    role: "runtime_fact",
    sourceOwner: "worker_process",
    requiredForPresentEdge: true,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/worker-run"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-invocation-package",
    relativePath: "worker_invocation_package.json",
    carrierKind: null,
    role: "worker_projection",
    sourceOwner: "handoff_projection",
    requiredForPresentEdge: true,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://worker-prompt",
    relativePath: "worker_prompt.md",
    carrierKind: null,
    role: "worker_projection",
    sourceOwner: "handoff_projection",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://worker-prompt-asset",
    relativePath: "worker_prompt_asset.json",
    carrierKind: "sdlc_prompt_invocation_asset",
    role: "worker_projection",
    sourceOwner: "handoff_projection",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/worker-prompt-asset"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-stdout",
    relativePath: "worker_stdout.log",
    carrierKind: null,
    role: "forensic_payload",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://worker-stderr",
    relativePath: "worker_stderr.log",
    carrierKind: null,
    role: "forensic_payload",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://handoff-manifest",
    relativePath: "handoff_manifest.json",
    carrierKind: "sdlc_worker_handoff_manifest",
    role: "worker_projection",
    sourceOwner: "handoff_projection",
    requiredForPresentEdge: true,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/handoff-manifest"
  }),
  row({
    artifactRef: "operator-run-artifact://fp-evaluate-result",
    relativePath: "fp_evaluate_result.json",
    carrierKind: "sdlc_fp_evaluate_result",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: true,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/fp-evaluate-result"
  }),
  row({
    artifactRef: "operator-run-artifact://evaluate-compute-subworkstream-manifest",
    relativePath: "evaluate_compute_subworkstream_manifest.json",
    carrierKind: "sdlc_compute_subworkstream_manifest",
    role: "read_model",
    sourceOwner: "fp_evaluator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef:
      "admission://odd-sdlc/operator-run/evaluate-compute-subworkstream-manifest"
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-assessment",
    relativePath: "review_grade_edge_fulfillment_assessment.json",
    carrierKind: "sdlc_review_grade_edge_fulfillment_assessment",
    role: "authority_admission",
    sourceOwner: "fp_evaluator",
    requiredForPresentEdge: false,
    requiredWhen: "review_grade_edge_fulfillment_required",
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/review-grade-edge-fulfillment-assessment"
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-run",
    relativePath: "review_grade_edge_fulfillment_run.json",
    carrierKind: "sdlc_review_grade_edge_fulfillment_run",
    role: "runtime_fact",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    requiredWhen: "review_grade_edge_fulfillment_required",
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/review-grade-edge-fulfillment-run"
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-prompt",
    relativePath: "review_grade_edge_fulfillment_prompt.md",
    carrierKind: null,
    role: "worker_projection",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-prompt-asset",
    relativePath: "review_grade_edge_fulfillment_prompt_asset.json",
    carrierKind: "sdlc_prompt_invocation_asset",
    role: "worker_projection",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef:
      "admission://odd-sdlc/operator-run/review-grade-edge-fulfillment-prompt-asset"
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-postflight",
    relativePath: "review_grade_postflight.json",
    carrierKind: "sdlc_operator_postflight_result",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/review-grade-postflight"
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-stdout",
    relativePath: "review_grade_edge_fulfillment_stdout.log",
    carrierKind: null,
    role: "forensic_payload",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-stderr",
    relativePath: "review_grade_edge_fulfillment_stderr.log",
    carrierKind: null,
    role: "forensic_payload",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-last-message",
    relativePath: "review_grade_edge_fulfillment_last_message.txt",
    carrierKind: null,
    role: "forensic_payload",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-process-started",
    relativePath: "review_grade_edge_fulfillment_process_started.json",
    carrierKind: "actor_process_started",
    role: "runtime_fact",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    requiredWhen: "review_grade_edge_fulfillment_required",
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/review-grade-edge-fulfillment-process-started"
  }),
  row({
    artifactRef: "operator-run-artifact://review-grade-edge-fulfillment-process-events",
    relativePath: "review_grade_edge_fulfillment_process_events.jsonl",
    carrierKind: "jsonl:runtime_event",
    role: "runtime_fact",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/review-grade-edge-fulfillment-process-events"
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-run",
    relativePath: "design_depth_fp_evaluator_run.json",
    carrierKind: "sdlc_design_depth_fp_evaluator_run",
    role: "runtime_fact",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/design-depth-fp-evaluator-run"
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-first-update",
    relativePath: "design_depth_fp_evaluator_first_update.json",
    carrierKind: "sdlc_design_depth_fp_evaluator_first_update_observation",
    role: "runtime_fact",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    requiredWhen: "implementation_design_surface_present",
    malformedGapTracked: true,
    admissionRef:
      "admission://odd-sdlc/operator-run/design-depth-fp-evaluator-first-update"
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-content-register",
    relativePath: "design_depth_fp_evaluator_content_register.json",
    carrierKind: "sdlc_evaluate_content_register",
    role: "authority_admission",
    sourceOwner: "fp_evaluator",
    requiredForPresentEdge: false,
    requiredWhen: "implementation_design_surface_present",
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/design-depth-fp-evaluator-content-register"
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-rule-outcome",
    relativePath: "design_depth_fp_evaluator_rule_outcome.json",
    carrierKind: "evaluation_rule_outcome",
    role: "authority_admission",
    sourceOwner: "fp_evaluator",
    requiredForPresentEdge: false,
    requiredWhen: "implementation_design_surface_present",
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/design-depth-fp-evaluator-rule-outcome"
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-register",
    relativePath: "design_depth_fp_evaluator_register.json",
    carrierKind: "sdlc_design_depth_register",
    role: "authority_admission",
    sourceOwner: "fp_evaluator",
    requiredForPresentEdge: false,
    requiredWhen: "implementation_design_surface_present",
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/design-depth-fp-evaluator-register"
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-prompt",
    relativePath: "design_depth_fp_evaluator_prompt.md",
    carrierKind: null,
    role: "worker_projection",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-prompt-asset",
    relativePath: "design_depth_fp_evaluator_prompt_asset.json",
    carrierKind: "sdlc_prompt_invocation_asset",
    role: "worker_projection",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef:
      "admission://odd-sdlc/operator-run/design-depth-fp-evaluator-prompt-asset"
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-stdout",
    relativePath: "design_depth_fp_evaluator_stdout.log",
    carrierKind: null,
    role: "forensic_payload",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-stderr",
    relativePath: "design_depth_fp_evaluator_stderr.log",
    carrierKind: null,
    role: "forensic_payload",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-last-message",
    relativePath: "design_depth_fp_evaluator_last_message.txt",
    carrierKind: null,
    role: "forensic_payload",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: null
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-process-started",
    relativePath: "design_depth_fp_evaluator_process_started.json",
    carrierKind: "actor_process_started",
    role: "runtime_fact",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/design-depth-fp-evaluator-process-started"
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-process-events",
    relativePath: "design_depth_fp_evaluator_process_events.jsonl",
    carrierKind: "jsonl:runtime_event",
    role: "runtime_fact",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/design-depth-fp-evaluator-process-events"
  }),
  row({
    artifactRef: "operator-run-artifact://design-depth-fp-evaluator-postflight",
    relativePath: "design_depth_fp_evaluator_postflight.json",
    carrierKind: "sdlc_operator_postflight_result",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    requiredWhen: "implementation_design_surface_present",
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/design-depth-fp-evaluator-postflight"
  }),
  row({
    artifactRef: "operator-run-artifact://fp-evaluator-postflight",
    relativePath: "fp_evaluator_postflight.json",
    carrierKind: "sdlc_operator_postflight_result",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/fp-evaluator-postflight"
  }),
  row({
    artifactRef: "operator-run-artifact://postflight",
    relativePath: "postflight.json",
    carrierKind: "sdlc_operator_postflight_result",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/postflight"
  }),
  row({
    artifactRef: "operator-run-artifact://postflight-gap-dossier",
    relativePath: "gap_dossier.json",
    carrierKind: "sdlc_postflight_gap_dossier",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/postflight-gap-dossier"
  }),
  row({
    artifactRef: "operator-run-artifact://edge-closure",
    relativePath: "sdlc_edge_closure_decision.json",
    carrierKind: "sdlc_edge_closure_decision",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: true,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/edge-closure"
  }),
  row({
    artifactRef: "operator-run-artifact://edge-fulfillment-ledger",
    relativePath: "sdlc_edge_fulfillment_ledger.json",
    carrierKind: "sdlc_edge_fulfillment_ledger",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: true,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/edge-fulfillment-ledger"
  }),
  row({
    artifactRef: "operator-run-artifact://edge-gain",
    relativePath: "sdlc_edge_gain.json",
    carrierKind: "sdlc_edge_gain",
    role: "read_model",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/edge-gain"
  }),
  row({
    artifactRef: "operator-run-artifact://next-action-projection",
    relativePath: "sdlc_next_action_projection.json",
    carrierKind: "sdlc_next_action_projection",
    role: "read_model",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: true,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/next-action-projection"
  }),
  row({
    artifactRef: "operator-run-artifact://product-materialization-manifest",
    relativePath: "product_materialization_manifest.json",
    carrierKind: "sdlc_product_materialization_manifest",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    requiredWhen: "closed_product_edge_requires_materialization_manifest",
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/product-materialization-manifest"
  }),
  row({
    artifactRef: "operator-run-artifact://runtime-events",
    relativePath: "runtime_events.json",
    carrierKind: "sdlc_runtime_event_archive_projection",
    role: "runtime_fact",
    sourceOwner: "abg_runtime",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/runtime-events"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-process-started",
    relativePath: "worker_process_started.json",
    carrierKind: "actor_process_started",
    role: "runtime_fact",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/worker-process-started"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-process-events",
    relativePath: "worker_process_events.jsonl",
    carrierKind: "jsonl:runtime_event",
    role: "runtime_fact",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/worker-process-events"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-result-report",
    relativePath: "worker_result_report.json",
    carrierKind: "odd_sdlc.worker_result_report",
    role: "worker_projection",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/worker-result-report"
  }),
  row({
    artifactRef: "operator-run-artifact://compute-subworkstream-manifest",
    relativePath: "compute_subworkstream_manifest.json",
    carrierKind: "sdlc_compute_subworkstream_manifest",
    role: "worker_projection",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/compute-subworkstream-manifest"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-construction-brief",
    relativePath: "worker_construction_brief.json",
    carrierKind: "sdlc_worker_construction_brief",
    role: "worker_projection",
    sourceOwner: "handoff_projection",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/worker-construction-brief"
  }),
  row({
    artifactRef: "operator-run-artifact://fp-transform-request",
    relativePath: "fp_transform_request.json",
    carrierKind: "fp_transform_request",
    role: "runtime_fact",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/fp-transform-request"
  }),
  row({
    artifactRef: "operator-run-artifact://fp-transform-result",
    relativePath: "fp_transform_result.json",
    carrierKind: "fp_transform_result",
    role: "runtime_fact",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/fp-transform-result"
  }),
  row({
    artifactRef: "operator-run-artifact://hook-outcome",
    relativePath: "hook_outcome.json",
    carrierKind: "sdlc_hook_turn_outcome",
    role: "runtime_fact",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/hook-outcome"
  }),
  row({
    artifactRef: "operator-run-artifact://post-transform-observation",
    relativePath: "post_transform_observation.json",
    carrierKind: "sdlc_post_transform_observation",
    role: "read_model",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/post-transform-observation"
  }),
  row({
    artifactRef: "operator-run-artifact://worksite-evidence",
    relativePath: "sdlc_worksite_evidence.json",
    carrierKind: "sdlc_worksite_evidence",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/worksite-evidence"
  }),
  row({
    artifactRef: "operator-run-artifact://decomposition-summary",
    relativePath: "sdlc_decomposition_summary.json",
    carrierKind: "sdlc_decomposition_summary",
    role: "authority_admission",
    sourceOwner: "staged_construction_admission",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/decomposition-summary"
  }),
  row({
    artifactRef: "operator-run-artifact://implementation-decomposition-summary",
    relativePath: "sdlc_implementation_decomposition_summary.json",
    carrierKind: "sdlc_decomposition_summary",
    role: "authority_admission",
    sourceOwner: "staged_construction_admission",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/implementation-decomposition-summary"
  }),
  row({
    artifactRef: "operator-run-artifact://test-decomposition-summary",
    relativePath: "sdlc_test_decomposition_summary.json",
    carrierKind: "sdlc_decomposition_summary",
    role: "authority_admission",
    sourceOwner: "staged_construction_admission",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/test-decomposition-summary"
  }),
  row({
    artifactRef: "operator-run-artifact://traversal-hop-selection",
    relativePath: "sdlc_traversal_hop_selection.json",
    carrierKind: "sdlc_traversal_hop_selection",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/traversal-hop-selection"
  }),
  row({
    artifactRef: "operator-run-artifact://edge-residual-pressure",
    relativePath: "sdlc_edge_residual_pressure.json",
    carrierKind: "sdlc_edge_residual_pressure",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/edge-residual-pressure"
  }),
  row({
    artifactRef: "operator-run-artifact://module-dependency-map",
    relativePath: "sdlc_module_dependency_map.json",
    carrierKind: "sdlc_module_dependency_map",
    role: "authority_admission",
    sourceOwner: "staged_construction_admission",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/module-dependency-map"
  }),
  row({
    artifactRef: "operator-run-artifact://module-dependency-traversal-selection",
    relativePath: "sdlc_module_dependency_traversal_selection.json",
    carrierKind: "sdlc_dependency_traversal_selection",
    role: "authority_admission",
    sourceOwner: "staged_construction_admission",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/module-dependency-traversal-selection"
  }),
  row({
    artifactRef: "operator-run-artifact://test-dependency-map",
    relativePath: "sdlc_test_dependency_map.json",
    carrierKind: "sdlc_test_dependency_map",
    role: "authority_admission",
    sourceOwner: "staged_construction_admission",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/test-dependency-map"
  }),
  row({
    artifactRef: "operator-run-artifact://test-dependency-traversal-selection",
    relativePath: "sdlc_test_dependency_traversal_selection.json",
    carrierKind: "sdlc_dependency_traversal_selection",
    role: "authority_admission",
    sourceOwner: "staged_construction_admission",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/test-dependency-traversal-selection"
  }),
  row({
    artifactRef: "operator-run-artifact://uat-test-dependency-map",
    relativePath: "sdlc_uat_test_dependency_map.json",
    carrierKind: "sdlc_test_dependency_map",
    role: "authority_admission",
    sourceOwner: "staged_construction_admission",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/uat-test-dependency-map"
  }),
  row({
    artifactRef: "operator-run-artifact://uat-test-dependency-traversal-selection",
    relativePath: "sdlc_uat_test_dependency_traversal_selection.json",
    carrierKind: "sdlc_dependency_traversal_selection",
    role: "authority_admission",
    sourceOwner: "staged_construction_admission",
    requiredForPresentEdge: false,
    malformedGapTracked: true,
    admissionRef:
      "admission://odd-sdlc/operator-run/uat-test-dependency-traversal-selection"
  }),
  row({
    artifactRef: "operator-run-artifact://live-fp-parallel-materialization-frontier",
    relativePath: "sdlc_live_fp_parallel_materialization_frontier.json",
    carrierKind: "sdlc_live_fp_parallel_materialization_frontier",
    role: "runtime_fact",
    sourceOwner: "abg_runtime",
    requiredForPresentEdge: false,
    requiredWhen: "parallel_dependency_traversal_selected",
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/live-fp-parallel-materialization-frontier"
  }),
  row({
    artifactRef: "operator-run-artifact://run-performance-summary",
    relativePath: "run_performance_summary.json",
    carrierKind: "sdlc_run_performance_summary",
    role: "read_model",
    sourceOwner: "analysis_projection",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/run-performance-summary"
  }),
  row({
    artifactRef: "operator-run-artifact://edge-performance-summary",
    relativePath: "edge_performance_summary.json",
    carrierKind: "sdlc_edge_performance_summary",
    role: "read_model",
    sourceOwner: "analysis_projection",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/edge-performance-summary"
  }),
  row({
    artifactRef: "operator-run-artifact://declared-edge-projection-artifact",
    relativePath: "declared_edge_projection_artifact.json",
    carrierKind: "sdlc_declared_edge_projection_artifact",
    role: "read_model",
    sourceOwner: "consequence_projection",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/declared-edge-projection-artifact"
  }),
  row({
    artifactRef: "operator-run-artifact://frontdoor-decomposition-summary",
    relativePath: "sdlc_frontdoor_decomposition_summary.json",
    carrierKind: "sdlc_decomposition_summary",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/frontdoor-decomposition-summary"
  }),
  row({
    artifactRef: "operator-run-artifact://frontdoor-traversal-hop-selection",
    relativePath: "sdlc_frontdoor_traversal_hop_selection.json",
    carrierKind: "sdlc_traversal_hop_selection",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/frontdoor-traversal-hop-selection"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-process-started-context",
    relativePath: "worker_process_started_context.json",
    carrierKind: "sdlc_worker_process_started_context",
    role: "runtime_fact",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/worker-process-started-context"
  }),
  row({
    artifactRef: "operator-run-artifact://runtime-liveness-observer-projection",
    relativePath: "runtime_liveness_observer_projection.json",
    carrierKind: "runtime_liveness_observer_projection",
    role: "read_model",
    sourceOwner: "analysis_projection",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/runtime-liveness-observer-projection"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-process-summary",
    relativePath: "worker_process_summary.json",
    carrierKind: "sdlc_worker_process_summary",
    role: "runtime_fact",
    sourceOwner: "worker_process",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/worker-process-summary"
  }),
  row({
    artifactRef: "operator-run-artifact://gtl-admitted-state-ref",
    relativePath: "gtl_admitted_state_ref.json",
    carrierKind: "gtl_admitted_state_ref",
    role: "authority_admission",
    sourceOwner: "abg_runtime",
    requiredForPresentEdge: true,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/gtl-admitted-state-ref"
  }),
  row({
    artifactRef: "operator-run-artifact://gtl-consequence-projection-ref",
    relativePath: "gtl_consequence_projection_ref.json",
    carrierKind: "gtl_consequence_projection_ref",
    role: "read_model",
    sourceOwner: "abg_runtime",
    requiredForPresentEdge: true,
    malformedGapTracked: true,
    admissionRef: "admission://odd-sdlc/operator-run/gtl-consequence-projection-ref"
  }),
  row({
    artifactRef: "operator-run-artifact://construction-intent",
    relativePath: "sdlc_construction_intent.json",
    carrierKind: "sdlc_construction_intent",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/construction-intent"
  }),
  row({
    artifactRef: "operator-run-artifact://overlay-segment-completion",
    relativePath: "sdlc_overlay_segment_completion.json",
    carrierKind: "sdlc_overlay_segment_completion",
    role: "read_model",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/overlay-segment-completion"
  }),
  row({
    artifactRef: "operator-run-artifact://overlay-binding-post-action",
    relativePath: "sdlc_overlay_binding_post_action.json",
    carrierKind: "sdlc_overlay_binding",
    role: "read_model",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/overlay-binding-post-action"
  }),
  row({
    artifactRef: "operator-run-artifact://assurance-satisfaction",
    relativePath: "assurance_satisfaction.json",
    carrierKind: "sdlc_traversal_requirement_satisfaction",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/assurance-satisfaction"
  }),
  row({
    artifactRef: "operator-run-artifact://constructor-result",
    relativePath: "constructor_result.json",
    carrierKind: "sdlc_constructor_result",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/constructor-result"
  }),
  row({
    artifactRef: "operator-run-artifact://hook-diagnostics",
    relativePath: "hook_diagnostics.json",
    carrierKind: "sdlc_operator_postflight_result",
    role: "forensic_payload",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/hook-diagnostics"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-report-admission-postflight",
    relativePath: "worker_report_admission_postflight.json",
    carrierKind: "sdlc_operator_postflight_result",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/worker-report-admission-postflight"
  }),
  row({
    artifactRef: "operator-run-artifact://worker-process-failure-postflight",
    relativePath: "worker_process_failure_postflight.json",
    carrierKind: "sdlc_operator_postflight_result",
    role: "authority_admission",
    sourceOwner: "installed_operator",
    requiredForPresentEdge: false,
    malformedGapTracked: false,
    admissionRef: "admission://odd-sdlc/operator-run/worker-process-failure-postflight"
  })
] as const satisfies readonly SdlcOperatorRunArtifactRow[]);

export function operatorRunArtifactRows(input?: {
  readonly requiredForPresentEdge?: boolean | undefined;
  readonly requiredWhen?: SdlcOperatorRunArtifactRequiredWhen | undefined;
  readonly malformedGapTracked?: boolean | undefined;
}): readonly SdlcOperatorRunArtifactRow[] {
  return Object.freeze(
    SDLC_OPERATOR_RUN_ARTIFACT_CATALOG.filter((artifact) => {
      if (
        input?.requiredForPresentEdge !== undefined &&
        artifact.requiredForPresentEdge !== input.requiredForPresentEdge
      ) {
        return false;
      }
      if (
        input?.malformedGapTracked !== undefined &&
        artifact.malformedGapTracked !== input.malformedGapTracked
      ) {
        return false;
      }
      if (
        input?.requiredWhen !== undefined &&
        artifact.requiredWhen !== input.requiredWhen
      ) {
        return false;
      }
      return true;
    })
  );
}

export function operatorRunArtifactRowForRelativePath(
  relativePath: string
): SdlcOperatorRunArtifactRow | null {
  return SDLC_OPERATOR_RUN_ARTIFACT_CATALOG.find(
    (artifact) => artifact.relativePath === relativePath
  ) ?? null;
}

export function operatorRunArtifactRowForArtifactRef(
  artifactRef: string
): SdlcOperatorRunArtifactRow | null {
  return SDLC_OPERATOR_RUN_ARTIFACT_CATALOG.find(
    (artifact) => artifact.artifactRef === artifactRef
  ) ?? null;
}

export function requireOperatorRunArtifactRowForArtifactRef(
  artifactRef: string
): SdlcOperatorRunArtifactRow {
  const row = operatorRunArtifactRowForArtifactRef(artifactRef);
  if (row === null) {
    throw new TypeError(`${artifactRef}: unknown operator-run artifact ref`);
  }
  return row;
}

export function isSdlcOperatorRunArtifactRequiredForContext(input: {
  readonly artifact: SdlcOperatorRunArtifactRow;
  readonly context: SdlcOperatorRunArtifactRequirednessContext;
}): boolean {
  if (input.artifact.requiredForPresentEdge) {
    return true;
  }
  if (input.artifact.requiredWhen === undefined) {
    return false;
  }
  if (
    !input.context.productGraphRequiredArtifactRefs.includes(input.artifact.artifactRef)
  ) {
    return false;
  }
  if (input.artifact.requiredWhen === "parallel_dependency_traversal_selected") {
    return input.context.selectedDependencyTraversalMethods.includes("parallel");
  }
  if (
    input.artifact.requiredWhen ===
    "closed_product_edge_requires_materialization_manifest"
  ) {
    return input.context.closureDisposition === "close";
  }
  if (input.artifact.requiredWhen === "implementation_design_surface_present") {
    return input.context.targetAssetType === "implementation_design_surface";
  }
  if (input.artifact.requiredWhen === "review_grade_edge_fulfillment_required") {
    return input.context.edgeRef !== null && input.context.targetAssetType !== null;
  }
  return false;
}
