// T-163 MindForge AI assistant scenario family.
// The fixtures are declaration data. The generated governance-control product
// must be built inside each fresh sandbox workspace by installed odd_sdlc.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_FAMILY_ROOT = resolve(HERE, "../../fixtures/mindforge_ai_assistant");

const COMMON_SOURCE_FILES = Object.freeze([
  "bootstrap.md",
  ".ai-workspace/context/project_constraints.yml",
  ".ai-workspace/context/project_bootstrap.md",
  "build_tenants/TENANT_REGISTRY.md",
  "specification/INTENT.md",
  "specification/PRODUCT.md",
  "specification/GOALS.md",
  "specification/requirements/00-imported-sources.md",
  "specification/requirements/01-mindforge-governance-output.md"
]);

const BOOTSTRAP_REQUIREMENTS_OVERLAY_REF =
  "overlay://odd-sdlc/bootstrap-requirements";

function projection(input) {
  return Object.freeze({
    useCaseId: input.useCaseId,
    inventoryStatus: input.inventoryStatus,
    riskTier: input.riskTier,
    controlPath: input.controlPath,
    preDeploymentGate: input.preDeploymentGate,
    monitoring: Object.freeze([...input.monitoring]),
    thirdPartyDisclosureRequired: input.thirdPartyDisclosureRequired,
    recertification: input.recertification,
    sourceVariant: input.sourceVariant
  });
}

const VARIANT_ROWS = Object.freeze([
  Object.freeze({
    id: "baseline_internal_assistant",
    label: "baseline internal assistant",
    fixtureDir: "baseline_internal_assistant",
    installedPackageName: "odd-sdlc-scenario-t163-mindforge-baseline",
    extraSourceFiles: Object.freeze([]),
    expectedOutput: projection({
      useCaseId: "MF-AI-001",
      inventoryStatus: "registered",
      riskTier: "moderate",
      controlPath: "enhanced_review",
      preDeploymentGate: "pending_ai_risk_review",
      monitoring: ["unsupported_answer_rate", "policy_content_staleness"],
      thirdPartyDisclosureRequired: false,
      recertification: "annual_or_material_change",
      sourceVariant: "baseline_internal_assistant"
    })
  }),
  Object.freeze({
    id: "third_party_model_variant",
    label: "third-party model variant",
    fixtureDir: "third_party_model_variant",
    installedPackageName: "odd-sdlc-scenario-t163-mindforge-third-party",
    extraSourceFiles: Object.freeze(["evidence/third_party_ai_card.md"]),
    expectedOutput: projection({
      useCaseId: "MF-AI-001",
      inventoryStatus: "registered",
      riskTier: "moderate",
      controlPath: "third_party_enhanced_review",
      preDeploymentGate: "pending_vendor_ai_risk_review",
      monitoring: [
        "unsupported_answer_rate",
        "policy_content_staleness",
        "third_party_model_change"
      ],
      thirdPartyDisclosureRequired: true,
      recertification: "annual_or_provider_change",
      sourceVariant: "third_party_model_variant"
    })
  }),
  Object.freeze({
    id: "high_risk_customer_impact_variant",
    label: "high-risk customer impact variant",
    fixtureDir: "high_risk_customer_impact_variant",
    installedPackageName: "odd-sdlc-scenario-t163-mindforge-high-risk",
    extraSourceFiles: Object.freeze([]),
    expectedOutput: projection({
      useCaseId: "MF-AI-002",
      inventoryStatus: "registered",
      riskTier: "high",
      controlPath: "senior_committee_review",
      preDeploymentGate: "pending_senior_ai_committee_approval",
      monitoring: [
        "unsupported_answer_rate",
        "customer_impact_override_rate",
        "residual_risk_open_items"
      ],
      thirdPartyDisclosureRequired: false,
      recertification: "semi_annual_or_material_change",
      sourceVariant: "high_risk_customer_impact_variant"
    })
  }),
  Object.freeze({
    id: "material_change_recertification_variant",
    label: "material-change recertification variant",
    fixtureDir: "material_change_recertification_variant",
    installedPackageName: "odd-sdlc-scenario-t163-mindforge-material-change",
    extraSourceFiles: Object.freeze([]),
    expectedOutput: projection({
      useCaseId: "MF-AI-003",
      inventoryStatus: "registered_material_change",
      riskTier: "moderate",
      controlPath: "recertification_review",
      preDeploymentGate: "pending_material_change_recertification",
      monitoring: [
        "unsupported_answer_rate",
        "policy_content_staleness",
        "material_change_completion"
      ],
      thirdPartyDisclosureRequired: false,
      recertification: "reopened_due_to_material_change",
      sourceVariant: "material_change_recertification_variant"
    })
  })
]);

function sourceFilesFor(row) {
  return Object.freeze([...COMMON_SOURCE_FILES, ...row.extraSourceFiles]);
}

function scenarioFor(row) {
  return Object.freeze({
    scenarioId: `scenario_t163_mindforge_ai_assistant_${row.id}`,
    installedPackageName: row.installedPackageName,
    fixture: {
      root: resolve(FIXTURE_FAMILY_ROOT, row.fixtureDir),
      sourceFiles: sourceFilesFor(row)
    },
    expectations: {
      terminalStatus: "blocked",
      firstStartStatus: "blocked",
      firstStartOverlayRef: BOOTSTRAP_REQUIREMENTS_OVERLAY_REF,
      firstStartTargetGraphFunction: "bootstrap_requirements"
    },
    expectedGovernanceOutput: row.expectedOutput,
    startTarget: "overlay:bootstrap-requirements",
    startUntil: "first_traversal",
    maxAdvances: 1
  });
}

export const MINDFORGE_AI_ASSISTANT_FIXTURE_FAMILY_ROOT =
  FIXTURE_FAMILY_ROOT;
export const MINDFORGE_AI_ASSISTANT_VARIANT_ROWS = VARIANT_ROWS;
export const MINDFORGE_AI_ASSISTANT_COMMON_SOURCE_FILES =
  COMMON_SOURCE_FILES;

export const mindforgeAiAssistantBaselineScenario = scenarioFor(
  VARIANT_ROWS[0]
);

export const mindforgeAiAssistantVariantScenarios = Object.freeze(
  VARIANT_ROWS.slice(1).map(scenarioFor)
);

export const mindforgeAiAssistantScenarioFamily = Object.freeze([
  mindforgeAiAssistantBaselineScenario,
  ...mindforgeAiAssistantVariantScenarios
]);

export function mindforgeAiAssistantLiveScenario({
  worker,
  variant = "third_party_model_variant",
  maxAdvances = 8,
  startUntil = "first_traversal"
}) {
  if (typeof worker !== "string" || worker.length === 0) {
    throw new Error("mindforgeAiAssistantLiveScenario requires a worker URI");
  }
  const row = VARIANT_ROWS.find((candidate) => candidate.id === variant);
  if (row === undefined) {
    throw new Error(`unknown MindForge AI assistant variant: ${variant}`);
  }
  const base = scenarioFor(row);
  return Object.freeze({
    ...base,
    scenarioId: `${base.scenarioId}_live`,
    installedPackageName: `${row.installedPackageName}-live`,
    expectations: {
      workspaceFiles: [
        "build_tenants/mindforge_ai_assistant/package.json",
        "build_tenants/mindforge_ai_assistant/src/index.js",
        "build_tenants/mindforge_ai_assistant/examples/use_case.json"
      ],
      materializationEvidenceWorkspaceFiles: [
        "build_tenants/mindforge_ai_assistant/package.json",
        "build_tenants/mindforge_ai_assistant/src/index.js",
        "build_tenants/mindforge_ai_assistant/examples/use_case.json"
      ],
      handoffEdgeSequencePrefix: [
        "derive_lite_design_adr_surface",
        "derive_lite_component_code_surface",
        "derive_lite_test_design_surface",
        "derive_lite_component_test_surface",
        "derive_lite_uat_test_source_surface",
        "prepare_test_execution_surface",
        "derive_test_execution_result_surface"
      ],
      requiredHandoffEdges: [
        "derive_lite_component_code_surface",
        "derive_lite_test_design_surface",
        "derive_lite_component_test_surface",
        "derive_lite_uat_test_source_surface",
        "prepare_test_execution_surface",
        "derive_test_execution_result_surface"
      ],
      executionEvidence: {
        edgeName: "derive_test_execution_result_surface",
        status: "succeeded",
        commandIncludes: "node",
        stdoutIncludes: row.expectedOutput.useCaseId
      },
      processChecks: [
        {
          command: "node",
          args: [
            "build_tenants/mindforge_ai_assistant/src/index.js",
            "build_tenants/mindforge_ai_assistant/examples/use_case.json"
          ],
          stdoutJson: {
            hasKeys: [
              "useCaseId",
              "inventoryStatus",
              "riskTier",
              "controlPath",
              "preDeploymentGate",
              "monitoring",
              "thirdPartyDisclosureRequired",
              "recertification",
              "sourceVariant"
            ],
            equals: {
              useCaseId: row.expectedOutput.useCaseId,
              inventoryStatus: row.expectedOutput.inventoryStatus,
              riskTier: row.expectedOutput.riskTier,
              controlPath: row.expectedOutput.controlPath,
              preDeploymentGate: row.expectedOutput.preDeploymentGate,
              thirdPartyDisclosureRequired:
                row.expectedOutput.thirdPartyDisclosureRequired,
              recertification: row.expectedOutput.recertification,
              sourceVariant: row.expectedOutput.sourceVariant
            },
            arrayMembers: {
              monitoring: row.expectedOutput.monitoring
            }
          }
        }
      ],
      latestArchiveArtifacts: [
        "worker_result_report.json",
        "declared_edge_projection_artifact.json"
      ]
    },
    expectedGovernanceOutput: row.expectedOutput,
    liveWorker: worker,
    startTarget: "overlay:lite-design-module-implementation",
    startUntil,
    maxAdvances,
    continueOnEdgeConverge: true,
    stopAfterWorkspaceFilesExist: false,
    stopAfterRequiredHandoffEdges: true
  });
}
