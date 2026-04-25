import {
  constructInstalledSandboxBehaviorPortfolioGapRef,
  constructInstalledSandboxBehaviorPortfolioOutcome,
  constructPassedInstalledSandboxBehaviorPortfolioOutcome,
  constructPythonSandboxBehaviorScenarioObligation,
  constructRejectedInstalledSandboxBehaviorPortfolioOutcome
} from "./sandbox_behavior_portfolio_constructors.js";
import {
  collectQualificationObligationGaps,
  collectMissingEventKindGaps,
  collectRequiredScenarioCardinalityGaps,
  qualificationObligation
} from "./qualification_common.js";
import type {
  InstalledSandboxBehaviorPortfolioGapRef,
  InstalledSandboxBehaviorPortfolioOutcome,
  InstalledSandboxBehaviorPortfolioRequest,
  InstalledSandboxBehaviorScenarioResult,
  PythonSandboxBehaviorLane,
  PythonSandboxBehaviorScenarioObligation
} from "./sandbox_behavior_portfolio_carriers.js";
import { M05_REFERENCE_REQUIRED_EVENT_KINDS } from "./reference_obligations.js";

function obligation(input: {
  readonly scenarioName: string;
  readonly usecaseId: string;
  readonly lane: PythonSandboxBehaviorLane;
  readonly sourceFile: string;
  readonly sourceLine: number;
  readonly minStageCount: number;
  readonly minAssessmentCount?: number;
}): PythonSandboxBehaviorScenarioObligation {
  return constructPythonSandboxBehaviorScenarioObligation({
    scenarioName: input.scenarioName,
    usecaseId: input.usecaseId,
    lane: input.lane,
    sourceFile: input.sourceFile,
    sourceLine: input.sourceLine,
    minStageCount: input.minStageCount,
    minAssessmentCount: input.minAssessmentCount ?? 1,
    requiredEventKinds: M05_REFERENCE_REQUIRED_EVENT_KINDS
  });
}

export const M05_PYTHON_SANDBOX_BEHAVIOR_SCENARIO_OBLIGATIONS: readonly PythonSandboxBehaviorScenarioObligation[] =
  Object.freeze([
    obligation({
      scenarioName: "test_real_install_copies_complete_engine_runtime",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 344,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_install_creates_full_ai_workspace_skeleton_before_runtime_bootstrap",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 357,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_install_vendors_builder_docs_and_full_standards_tree",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 380,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_install_seeds_project_owned_spec_and_tenant_templates",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 415,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_runtime_source_keeps_emit_as_only_write_boundary_and_removes_drift_names",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 455,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_installed_runtime_can_execute_emit_event_from_workspace",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 483,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_workspace_bootstrap_creates_runtime_directories",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 515,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_workspace_bootstrap_is_idempotent",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 537,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_emit_writes_through_bound_stream",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 550,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_installed_cli_preserves_router_and_selected_execution_identity",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 566,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_installed_start_graph_function_target_drives_selected_manifest_and_event_chain",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 664,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_installed_start_asset_target_drives_selected_manifest_and_event_chain",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 726,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_installed_start_root_mode_supervised_converges_over_deterministic_chain",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 806,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_installed_runtime_reset_audit_supersedes_active_run_post_mortem",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 836,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_installed_runtime_reset_audit_abandons_open_continuation_post_mortem",
      usecaseId: "sandbox_install",
      lane: "install",
      sourceFile: "python/test_env/tests/test_sandbox_install.py",
      sourceLine: 907,
      minStageCount: 3
    }),
    obligation({
      scenarioName: "test_cumulative_environment_executive_converges_over_real_sandbox",
      usecaseId: "cumulative_env_exec",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 370,
      minStageCount: 3
    }),
    obligation({
      scenarioName: "test_intent_list_to_tagged_requirements_converges_over_real_sandbox",
      usecaseId: "intent_to_requirements",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 706,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_requirements_to_uat_converges_over_real_sandbox",
      usecaseId: "requirements_to_uat",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 763,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_gap_triggered_context_discovery_converges_over_real_sandbox",
      usecaseId: "u2_gap_triggered_context_discovery",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 820,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_profile_selection_spawns_children_and_reenters_engine",
      usecaseId: "u1_profile_selection",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 859,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_design_to_schema_zoom_selects_discovery_route_and_rebinds_parent",
      usecaseId: "u6_schema_zoom",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 917,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_discovered_schema_asset_surface_unblocks_downstream_code_edge",
      usecaseId: "u7_asset_surface_downstream_consumption",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 1032,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_gsdlc_lite_requirements_design_code_converges_over_real_sandbox",
      usecaseId: "gsdlc_lite",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 1193,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_gsdlc_lite_design_review_converges_over_real_sandbox",
      usecaseId: "gsdlc_lite_review",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 1265,
      minStageCount: 3,
      minAssessmentCount: 3
    }),
    obligation({
      scenarioName: "test_gsdlc_lite_design_review_reset_replays_edge",
      usecaseId: "gsdlc_lite_review_reset",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 1378,
      minStageCount: 3
    }),
    obligation({
      scenarioName: "test_gsdlc_lite_role_workers_advance_their_lawful_steps",
      usecaseId: "gsdlc_lite_roles",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 1494,
      minStageCount: 3,
      minAssessmentCount: 3
    }),
    obligation({
      scenarioName: "test_gsdlc_lite_code_edge_runs_bounded_leaf_subwork",
      usecaseId: "gsdlc_lite_leaf_subwork",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 1603,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_zoomed_design_selection_spawns_decomposition_chain",
      usecaseId: "gsdlc_lite_zoom",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 1753,
      minStageCount: 5
    }),
    obligation({
      scenarioName: "test_zoomed_design_selection_rebinds_parent_and_converges_design_lane",
      usecaseId: "gsdlc_lite_zoom",
      lane: "fake",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_fake.py",
      sourceLine: 1849,
      minStageCount: 5
    }),
    obligation({
      scenarioName: "test_requirements_to_uat_live_qualification",
      usecaseId: "requirements_to_uat",
      lane: "live",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_live.py",
      sourceLine: 192,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_intents_to_requirements_live_qualification",
      usecaseId: "intent_to_requirements",
      lane: "live",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_live.py",
      sourceLine: 258,
      minStageCount: 1
    }),
    obligation({
      scenarioName: "test_gsdlc_lite_requirements_design_code_live_qualification",
      usecaseId: "gsdlc_lite",
      lane: "live",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_live.py",
      sourceLine: 327,
      minStageCount: 2
    }),
    obligation({
      scenarioName: "test_gsdlc_lite_design_review_live_qualification",
      usecaseId: "gsdlc_lite_review",
      lane: "live",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_live.py",
      sourceLine: 424,
      minStageCount: 3,
      minAssessmentCount: 3
    }),
    obligation({
      scenarioName: "test_gsdlc_lite_zoom_design_live_qualification",
      usecaseId: "gsdlc_lite_zoom",
      lane: "live",
      sourceFile: "python/test_env/tests/test_sandbox_usecases_live.py",
      sourceLine: 563,
      minStageCount: 5
    })
  ]);

function laneCounts(
  scenarios: readonly InstalledSandboxBehaviorScenarioResult[]
): { readonly install: number; readonly fake: number; readonly live: number } {
  return Object.freeze({
    install: scenarios.filter((entry) => entry.lane === "install").length,
    fake: scenarios.filter((entry) => entry.lane === "fake").length,
    live: scenarios.filter((entry) => entry.lane === "live").length
  });
}

function expectedArchiveRef(
  obligation: PythonSandboxBehaviorScenarioObligation
): string {
  return `archive://${obligation.usecaseId}/${obligation.scenarioName}`;
}

function collectScenarioGaps(
  scenario: InstalledSandboxBehaviorScenarioResult,
  obligation: PythonSandboxBehaviorScenarioObligation
): readonly InstalledSandboxBehaviorPortfolioGapRef[] {
  return Object.freeze([
    ...collectQualificationObligationGaps({
      constructGap: constructInstalledSandboxBehaviorPortfolioGapRef,
      obligations: Object.freeze([
        qualificationObligation(
          scenario.passed,
          "failed_scenario",
          scenario.scenarioName
        ),
        qualificationObligation(
          scenario.usecaseId === obligation.usecaseId,
          "mismatched_usecase",
          `${scenario.scenarioName}:${scenario.usecaseId}`
        ),
        qualificationObligation(
          scenario.lane === obligation.lane,
          "mismatched_lane",
          `${scenario.scenarioName}:${scenario.lane}`
        ),
        qualificationObligation(
          scenario.sourceFile === obligation.sourceFile &&
            scenario.sourceLine === obligation.sourceLine,
          "mismatched_source",
          `${scenario.scenarioName}:${scenario.sourceFile}:${scenario.sourceLine}`
        ),
        qualificationObligation(
          scenario.stageCount >= obligation.minStageCount,
          "insufficient_stage_count",
          `${scenario.scenarioName}:${scenario.stageCount}`
        ),
        qualificationObligation(
          scenario.assessmentCount >= obligation.minAssessmentCount,
          "insufficient_assessment_count",
          `${scenario.scenarioName}:${scenario.assessmentCount}`
        ),
        qualificationObligation(
          scenario.finalRunStatus === "assessed",
          "unexpected_final_status",
          `${scenario.scenarioName}:${scenario.finalRunStatus}`
        ),
        qualificationObligation(
          scenario.evidenceRefs.includes(expectedArchiveRef(obligation)),
          "missing_archive_evidence_ref",
          `${scenario.scenarioName}:${expectedArchiveRef(obligation)}`
        )
      ])
    }),
    ...collectMissingEventKindGaps({
      observedEventKinds: scenario.emittedEventKinds,
      requiredEventKinds: obligation.requiredEventKinds,
      refPrefix: scenario.scenarioName,
      missingKind: "missing_event_kind",
      constructGap: constructInstalledSandboxBehaviorPortfolioGapRef
    })
  ]);
}

export function qualifyInstalledSandboxBehaviorPortfolio(
  request: InstalledSandboxBehaviorPortfolioRequest
): InstalledSandboxBehaviorPortfolioOutcome {
  const installedQualificationGaps = collectQualificationObligationGaps({
    constructGap: constructInstalledSandboxBehaviorPortfolioGapRef,
    obligations: Object.freeze([
      qualificationObligation(
        request.installedQualification.kind === "passed",
        "installed_qualification_failed",
        "installed_qualification"
      )
    ])
  });
  const scenarioGaps = M05_PYTHON_SANDBOX_BEHAVIOR_SCENARIO_OBLIGATIONS.flatMap((obligation) => {
    const cardinality = collectRequiredScenarioCardinalityGaps({
      scenarios: request.scenarios,
      scenarioName: obligation.scenarioName,
      getScenarioName: (scenario) => scenario.scenarioName,
      constructGap: constructInstalledSandboxBehaviorPortfolioGapRef,
      missingKind: "missing_scenario",
      duplicateKind: "duplicate_scenario"
    });

    if (cardinality.gaps.length > 0) {
      return cardinality.gaps;
    }

    const scenario = cardinality.matches[0];
    if (scenario !== undefined) {
      return collectScenarioGaps(scenario, obligation);
    }
    return [];
  });
  const gaps = Object.freeze([
    ...installedQualificationGaps,
    ...scenarioGaps
  ]);

  if (gaps.length > 0) {
    return constructInstalledSandboxBehaviorPortfolioOutcome(
      constructRejectedInstalledSandboxBehaviorPortfolioOutcome({
        reason: "installed sandbox behavior portfolio is incomplete",
        gaps
      })
    );
  }

  return constructInstalledSandboxBehaviorPortfolioOutcome(
    constructPassedInstalledSandboxBehaviorPortfolioOutcome({
      scenarioCount: M05_PYTHON_SANDBOX_BEHAVIOR_SCENARIO_OBLIGATIONS.length,
      laneCounts: laneCounts(request.scenarios),
      scenarioNames: M05_PYTHON_SANDBOX_BEHAVIOR_SCENARIO_OBLIGATIONS.map(
        (entry) => entry.scenarioName
      )
    })
  );
}
