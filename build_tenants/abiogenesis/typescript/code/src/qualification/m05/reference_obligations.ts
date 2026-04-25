import type {
  M05ReferenceLiveScenarioObligation,
  M05ReferenceObligation
} from "./reference_obligations_carriers.js";

export const M05_REFERENCE_REQUIRED_EVENT_KINDS: readonly string[] =
  Object.freeze([
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "fp_dispatch_requested",
    "assessed"
  ]);

export const M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS: readonly M05ReferenceLiveScenarioObligation[] =
  Object.freeze([
    Object.freeze({
      scenarioName: "requirements_to_uat",
      source: "python_sandbox_live",
      requiredAuthorityRefs: Object.freeze(["SCN-R2U-001"]),
      mode: "asset_addressed",
      stages: Object.freeze([
        Object.freeze({
          handle: "requirements_to_uat_flow",
          edge: "requirements→uat_tests",
          sourceKind: "requirements",
          targetKind: "uat_tests",
          assetHandle: "uat_surface",
          assessmentIds: Object.freeze(["scenario_quality"])
        })
      ]),
      minStageCount: 1,
      minAssessmentCount: 1
    }),
    Object.freeze({
      scenarioName: "intent_to_requirements",
      source: "python_sandbox_live",
      requiredAuthorityRefs: Object.freeze(["SCN-I2R-001"]),
      mode: "graph_function",
      stages: Object.freeze([
        Object.freeze({
          handle: "intent_to_requirements_flow",
          edge: "intents→requirements",
          sourceKind: "intents",
          targetKind: "requirements",
          assetHandle: null,
          assessmentIds: Object.freeze(["intent_traceability"])
        })
      ]),
      minStageCount: 1,
      minAssessmentCount: 1
    }),
    Object.freeze({
      scenarioName: "gsdlc_lite_requirements_design_code",
      source: "python_sandbox_live",
      requiredAuthorityRefs: Object.freeze(["SCN-GSDLCLITE-001"]),
      mode: "staged_chain",
      stages: Object.freeze([
        Object.freeze({
          handle: "requirements_to_design_flow",
          edge: "requirements→design",
          sourceKind: "requirements",
          targetKind: "design",
          assetHandle: null,
          assessmentIds: Object.freeze(["design_quality"])
        }),
        Object.freeze({
          handle: "design_to_code_flow",
          edge: "design→code",
          sourceKind: "design",
          targetKind: "code",
          assetHandle: null,
          assessmentIds: Object.freeze(["code_quality"])
        })
      ]),
      minStageCount: 2,
      minAssessmentCount: 1
    }),
    Object.freeze({
      scenarioName: "gsdlc_lite_design_review",
      source: "python_sandbox_live",
      requiredAuthorityRefs: Object.freeze(["SCN-GSDLCLITE-001"]),
      mode: "review_chain",
      stages: Object.freeze([
        Object.freeze({
          handle: "requirements_to_design_review_flow",
          edge: "requirements→design",
          sourceKind: "requirements",
          targetKind: "design",
          assetHandle: null,
          assessmentIds: Object.freeze(["design_quality"])
        }),
        Object.freeze({
          handle: "design_review_flow",
          edge: "design→design_review",
          sourceKind: "design",
          targetKind: "design_review",
          assetHandle: null,
          assessmentIds: Object.freeze([
            "design_review_architecture",
            "design_review_traceability",
            "design_review_sequencing"
          ])
        }),
        Object.freeze({
          handle: "review_to_code_flow",
          edge: "design_review→code",
          sourceKind: "design_review",
          targetKind: "code",
          assetHandle: null,
          assessmentIds: Object.freeze(["code_quality"])
        })
      ]),
      minStageCount: 3,
      minAssessmentCount: 3
    }),
    Object.freeze({
      scenarioName: "gsdlc_lite_zoom_design",
      source: "python_sandbox_live",
      requiredAuthorityRefs: Object.freeze(["SCN-GSDLCLITE-001"]),
      mode: "zoom_chain",
      stages: Object.freeze([
        Object.freeze({
          handle: "requirements_to_decomposition_flow",
          edge: "requirements→decomposition",
          sourceKind: "requirements",
          targetKind: "decomposition",
          assetHandle: null,
          assessmentIds: Object.freeze(["zoom_progress"])
        }),
        Object.freeze({
          handle: "decomposition_to_dependency_chain_flow",
          edge: "decomposition→dependency_chain",
          sourceKind: "decomposition",
          targetKind: "dependency_chain",
          assetHandle: null,
          assessmentIds: Object.freeze(["zoom_progress"])
        }),
        Object.freeze({
          handle: "dependency_chain_to_sequencing_flow",
          edge: "dependency_chain→sequencing",
          sourceKind: "dependency_chain",
          targetKind: "sequencing",
          assetHandle: null,
          assessmentIds: Object.freeze(["zoom_progress"])
        }),
        Object.freeze({
          handle: "sequencing_to_design_flow",
          edge: "sequencing→design",
          sourceKind: "sequencing",
          targetKind: "design",
          assetHandle: null,
          assessmentIds: Object.freeze(["zoom_progress"])
        }),
        Object.freeze({
          handle: "requirements_to_design_parent_flow",
          edge: "requirements→design",
          sourceKind: "requirements",
          targetKind: "design",
          assetHandle: null,
          assessmentIds: Object.freeze(["zoom_progress"])
        })
      ]),
      minStageCount: 5,
      minAssessmentCount: 1
    })
  ]);

export const M05_REFERENCE_OBLIGATIONS: readonly M05ReferenceObligation[] =
  Object.freeze([
    Object.freeze({
      id: "m05-installed-runtime-package-surface",
      source: "python_sandbox_install",
      state: "repriced",
      requirementRefs: Object.freeze(["REQ-P-QUAL", "REQ-P-SCENARIOS"]),
      sourceRefs: Object.freeze([
        "python/test_env/tests/test_sandbox_install.py",
        "python/test_env/tests/sandbox_runtime.py"
      ]),
      proofRefs: Object.freeze([
        "test_m05_sandbox_install_integration.test.mjs",
        "test_m04_install_bootstrap_integration.test.mjs"
      ]),
      rationale:
        "Python file-copy install mechanics are repriced into a TypeScript package-first installed runtime surface."
    }),
    Object.freeze({
      id: "m05-installed-graph-function-target-selection",
      source: "python_sandbox_install",
      state: "proved",
      requirementRefs: Object.freeze([
        "REQ-P-QUAL",
        "REQ-P-SCENARIOS",
        "REQ-R-ABG3-INTERPRET",
        "REQ-R-ABG3-EVENTS"
      ]),
      sourceRefs: Object.freeze(["python/test_env/tests/test_sandbox_install.py"]),
      proofRefs: Object.freeze([
        "test_m05_installed_graph_function_target_integration.test.mjs"
      ]),
      rationale:
        "The Python installed start graph-function target test is translated into a packaged TypeScript sandbox proof over explicit graph-function selection, dispatch edge, manifest edge, and assessed event edge."
    }),
    Object.freeze({
      id: "m05-installed-live-scenario-portfolio",
      source: "python_sandbox_live",
      state: "proved",
      requirementRefs: Object.freeze(["REQ-P-QUAL", "REQ-P-SCENARIOS"]),
      sourceRefs: Object.freeze([
        "python/test_env/tests/test_sandbox_usecases_live.py"
      ]),
      proofRefs: Object.freeze([
        "test_m05_installed_live_portfolio_unit.test.mjs",
        "test_m05_installed_live_portfolio_integration.test.mjs",
        "test_m05_rc_live_portfolio.test.mjs",
        "t031-m05-live-portfolio-negative.test.mjs"
      ]),
      rationale:
        "The five Python live scenario families are carried as reusable TypeScript scenario obligations with exact stage, edge, asset, and assessment identity, proved on the installed package surface, and now executed through the RC external-live portfolio gate."
    }),
    Object.freeze({
      id: "m05-python-sandbox-behavior-portfolio",
      source: "python_sandbox_behavior_portfolio",
      state: "proved",
      requirementRefs: Object.freeze(["REQ-P-QUAL", "REQ-P-SCENARIOS"]),
      sourceRefs: Object.freeze([
        "python/test_env/tests/test_sandbox_install.py",
        "python/test_env/tests/test_sandbox_usecases_fake.py",
        "python/test_env/tests/test_sandbox_usecases_live.py"
      ]),
      proofRefs: Object.freeze([
        "test_m05_python_sandbox_behavior_portfolio_integration.test.mjs"
      ]),
      rationale:
        "The full 34-scenario Python archived sandbox behavior corpus is represented as TypeScript installed-package scenario obligations and qualified as one cumulative portfolio."
    }),
    Object.freeze({
      id: "m05-run-archive-finalization",
      source: "python_run_archive",
      state: "proved",
      requirementRefs: Object.freeze(["REQ-P-QUAL"]),
      sourceRefs: Object.freeze([
        "python/test_env/tests/test_run_archive.py",
        "python/test_env/tests/run_archive.py"
      ]),
      proofRefs: Object.freeze([
        "test_m05_archive_finalization_unit.test.mjs",
        "test_m05_run_archive_integration.test.mjs",
        "t030-m05-archive-finalization-negative.test.mjs"
      ]),
      rationale:
        "Archive qualification is backed by TypeScript archive materialization before assessment."
    }),
    Object.freeze({
      id: "m05-reset-postmortem-continuation",
      source: "python_reset_postmortem",
      state: "repriced",
      requirementRefs: Object.freeze(["REQ-P-QUAL", "REQ-P-SCENARIOS"]),
      sourceRefs: Object.freeze(["python/test_env/tests/test_sandbox_install.py"]),
      proofRefs: Object.freeze([
        "test_m05_installed_reset_postmortem_unit.test.mjs",
        "test_m05_installed_reset_postmortem_integration.test.mjs",
        "t032-m05-reset-postmortem-negative.test.mjs"
      ]),
      rationale:
        "Python reset audit behavior is repriced into accepted reset ingress plus installed postmortem truth."
    })
  ]);
