// Validates: T-120

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  compactSdlcPriorGapDossiersForRetryContext,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  sdlcBlockingReasonFromLegacy,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

function writeConstraints(root) {
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t120_retry_local_repair",
      "active_tenant: scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt",
      "    module_structure:",
      "      - retry-core"
    ].join("\n"),
    "utf8"
  );
}

function workspaceRoot() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t120-"));
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeConstraints(root);
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nINT-120: repair local typed carrier gaps.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    "# Requirements\n\nREQ-T120-001: Retry prompts must include exact typed carrier repair pressure.\n",
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function retryDossier() {
  const reason =
    "component_depth_register_invalid:component_depth_register.componentRealizationRows[0].bindingId: unexpected field";
  const blockingReason = sdlcBlockingReasonFromLegacy({ reason });
  return {
    kind: "sdlc_postflight_gap_dossier",
    status: "open",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "derive_component_code_surface",
    vectorIndex: 14,
    targetAssetType: "component_code_surface",
    reasons: [
      {
        kind: "sdlc_postflight_gap_reason",
        reason,
        reasonClass: "assurance",
        blockingReason: {
          ...blockingReason,
          evidenceRefs: ["file:///tmp/t120/component_code_surface.md"]
        }
      }
    ],
    evidenceRefs: [
      "file:///tmp/t120/component_code_surface.md",
      "file:///tmp/t120/postflight.json"
    ],
    priorManifestId: "file:///tmp/t120/handoff_manifest.json",
    currentGapDossierRef: "file:///tmp/t120/gap_dossier.json",
    retryEligible: true,
    nextLawfulActions: ["retry_same_edge", "repair_worker_output"]
  };
}

function retryDossierWithReasons(ref, reasons) {
  return {
    kind: "sdlc_postflight_gap_dossier",
    status: "open",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "Fg_conform_project_authority",
    vectorIndex: 0,
    targetAssetType: "project_bootstrap_surface",
    reasons: reasons.map((reason) => ({
      kind: "sdlc_postflight_gap_reason",
      reason,
      reasonClass: "assurance",
      blockingReason: {
        ...sdlcBlockingReasonFromLegacy({ reason }),
        code: "edge_closure_residual_pressure",
        reasonClass: "assurance",
        message: "Edge closure residual pressure requires same-edge repair.",
        detail: reason,
        lawfulReentryPoint: "repair_worker_output"
      }
    })),
    evidenceRefs: [ref],
    priorManifestId: `${ref}/handoff_manifest.json`,
    currentGapDossierRef: ref,
    retryEligible: true,
    nextLawfulActions: ["repair_worker_output"]
  };
}

function designRetryDossier() {
  const reason =
    "design_depth_register_invalid:design_depth_register.moduleSchemaFragments[0].entities[0].attributes[0].type: unexpected field";
  const blockingReason = sdlcBlockingReasonFromLegacy({ reason });
  return {
    kind: "sdlc_postflight_gap_dossier",
    status: "open",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "derive_implementation_design_surface",
    vectorIndex: 10,
    targetAssetType: "implementation_design_surface",
    reasons: [
      {
        kind: "sdlc_postflight_gap_reason",
        reason,
        reasonClass: "assurance",
        blockingReason
      }
    ],
    evidenceRefs: [
      "file:///tmp/t120/implementation_design_surface.md",
      "file:///tmp/t120/design_depth_candidate_0_normalized.json",
      "file:///tmp/t120/postflight.json"
    ],
    priorManifestId: "file:///tmp/t120/handoff_manifest.json",
    currentGapDossierRef: "file:///tmp/t120/gap_dossier.json",
    retryEligible: true,
    nextLawfulActions: ["retry_same_edge"]
  };
}

function designAttributeMissingRetryDossier() {
  const reason = "design_attribute_missing:entity:cdme-compiler.compilationjob";
  const blockingReason = sdlcBlockingReasonFromLegacy({ reason });
  return {
    kind: "sdlc_postflight_gap_dossier",
    status: "open",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "derive_implementation_design_surface",
    vectorIndex: 10,
    targetAssetType: "implementation_design_surface",
    reasons: [
      {
        kind: "sdlc_postflight_gap_reason",
        reason,
        reasonClass: "assurance",
        blockingReason
      }
    ],
    evidenceRefs: [
      "file:///tmp/t120/implementation_design_surface.md",
      "file:///tmp/t120/design_depth_candidate_0_normalized.json"
    ],
    priorManifestId: "file:///tmp/t120/handoff_manifest.json",
    currentGapDossierRef: "file:///tmp/t120/gap_dossier.json",
    retryEligible: true,
    nextLawfulActions: ["retry_same_edge"]
  };
}

function retryManifest() {
  const contract = hookContractByEdgeName("derive_component_code_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 12,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [retryDossier()]
    },
    runId: "t120-retry-local-repair"
  });
}

function nonRetryableReviewGradeTriageManifest() {
  const contract = hookContractByEdgeName("derive_uat_testcases_surface");
  const reason = "review_grade_evaluator_process_timeout:SIGTERM";
  const blockingReason = {
    kind: "sdlc_blocking_reason",
    code: "review_grade_evaluator_process_timeout",
    reasonClass: "assurance",
    lawfulReentryPoint: "triage_gap",
    message:
      "Review-grade evaluator process or assessment admission failed and requires operator triage.",
    detail: reason,
    evidenceRefs: ["file:///tmp/t120/review_grade_edge_fulfillment_run.json"]
  };
  return deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 4,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: contract.edgeName,
          vectorIndex: 4,
          targetAssetType: "uat_testcases_surface",
          reasons: [
            {
              kind: "sdlc_postflight_gap_reason",
              reason,
              reasonClass: "assurance",
              blockingReason
            }
          ],
          evidenceRefs: ["file:///tmp/t120/review_grade_edge_fulfillment_run.json"],
          priorManifestId: "file:///tmp/t120/handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t120/gap_dossier.json",
          retryEligible: false,
          nextLawfulActions: ["triage_gap"]
        }
      ]
    },
    runId: "t120-non-retryable-review-grade-triage"
  });
}

function outsidePathRetryManifest() {
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const root = workspaceRoot();
  const detail =
    "worker_stdout.log:1.message.content[0].input.path=/Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src";
  const reason = `worker_authority_read_outside_workspace:${detail}`;
  return deriveWorkerHandoffManifest({
    workspaceRoot: root,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 14,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: contract.edgeName,
          vectorIndex: 14,
          targetAssetType: "component_code_surface",
          reasons: [
            {
              kind: "sdlc_postflight_gap_reason",
              reason,
              reasonClass: "authority_to_code",
              blockingReason: {
                ...sdlcBlockingReasonFromLegacy({ reason }),
                detail,
                evidenceRefs: [],
                lawfulReentryPoint: "same_edge_retry"
              }
            }
          ],
          evidenceRefs: [],
          priorManifestId: "file:///tmp/t120/code-handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t120/code-gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["retry_same_edge"]
        }
      ]
    },
    runId: "t120-outside-path-retry"
  });
}

function componentRealizationManifest() {
  const contract = hookContractByEdgeName("derive_component_code_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 13,
    contract,
    runId: "t120-component-realization"
  });
}

function designRetryManifest() {
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [designRetryDossier()]
    },
    runId: "t120-retry-design-depth"
  });
}

function designAttributeMissingRetryManifest() {
  const contract = hookContractByEdgeName("derive_implementation_design_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 10,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [designAttributeMissingRetryDossier()]
    },
    runId: "t120-retry-design-attribute-missing"
  });
}

function executionRetryManifest() {
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const reason = "test_execution_evidence_missing";
  const blockingReason = sdlcBlockingReasonFromLegacy({ reason });
  return deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 26,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: "derive_test_execution_result_surface",
          vectorIndex: 26,
          targetAssetType: "test_execution_result_surface",
          reasons: [
            {
              kind: "sdlc_postflight_gap_reason",
              reason,
              reasonClass: "code_to_test",
              blockingReason
            }
          ],
          evidenceRefs: ["file:///tmp/t120/test_execution_result_surface.md"],
          priorManifestId: "file:///tmp/t120/handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t120/gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["retry_same_edge", "repair_worker_output"]
        }
      ]
    },
    runId: "t120-retry-execution-evidence"
  });
}

function repairScheduleRetryManifest() {
  const contract = hookContractByEdgeName("derive_component_repair_schedule_surface");
  const reason =
    "component_repair_schedule_unbound:repair:cdme-compiler:module-build-definition";
  const blockingReason = {
    ...sdlcBlockingReasonFromLegacy({ reason }),
    lawfulReentryPoint: "repair_worker_output"
  };
  return deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 28,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: "derive_component_repair_schedule_surface",
          vectorIndex: 28,
          targetAssetType: "component_repair_schedule_surface",
          reasons: [
            {
              kind: "sdlc_postflight_gap_reason",
              reason,
              reasonClass: "assurance",
              blockingReason
            }
          ],
          evidenceRefs: [
            "file:///tmp/t120/component_repair_schedule_surface.md",
            "file:///tmp/t120/gap_dossier.json"
          ],
          priorManifestId: "file:///tmp/t120/handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t120/gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["repair_worker_output"]
        }
      ]
    },
    runId: "t120-retry-repair-schedule"
  });
}

function componentRepairRowOpenRetryManifest() {
  const root = workspaceRoot();
  const releaseAssetRoot = path.join(
    root,
    ".ai-workspace/runtime/odd_sdlc/assets/t120-prior-release-depth"
  );
  const executionAssetRoot = path.join(
    root,
    ".ai-workspace/runtime/odd_sdlc/assets/t120-prior-test-execution"
  );
  mkdirSync(releaseAssetRoot, { recursive: true });
  mkdirSync(executionAssetRoot, { recursive: true });
  const releaseDepthPath = path.join(
    releaseAssetRoot,
    "release_depth_parity_surface.md"
  );
  const testExecutionPath = path.join(
    executionAssetRoot,
    "test_execution_result_surface.md"
  );
  writeFileSync(
    releaseDepthPath,
    JSON.stringify(
      {
        kind: "sdlc_component_depth_register",
        registerVersion: "ts-component-depth-v1",
        targetAssetType: "release_depth_parity_surface",
        componentRepairSchedule: {
          kind: "sdlc_component_repair_schedule",
          registerVersion: "ts-component-depth-v1",
          scheduleStatus: "repair_required",
          repairRows: [
            {
              kind: "sdlc_component_repair_schedule_row",
              scheduleId: "schedule.compiler.diagnostics.scalac.001",
              failureId: "fail.compiler.diagnostics.scalac.001",
              repairTarget: "component_test",
              lawfulReentryPoint: "realization_refactor",
              attributionConfidence: "high",
              testcaseIds: ["TC-DM-DIAG-001"],
              componentIds: ["cdme-diagnostics"],
              requirementIds: ["REQ-T115-001"],
              sourceRefs: [
                "build_tenants/scala_spark/cdme-compiler/src/main/scala/cdme/compiler/diagnostics/CompileDiagnostic.scala"
              ],
              testRefs: [
                "build_tenants/scala_spark/cdme-compiler/src/test/scala/cdme/compiler/diagnostics/DiagnosticsFinalizeSpec.scala"
              ],
              evidenceRefs: [`file://${testExecutionPath}`]
            }
          ],
          evidenceRefs: [`file://${testExecutionPath}`]
        },
        releaseDepthParity: {
          kind: "sdlc_release_depth_parity_assessment",
          status: "blocked",
          summary: "test shard failed at test_compile",
          blockingReasons: [
            "shard_compile_failed_no_test_evidence",
            "blocked_test_classes_have_no_pass_evidence"
          ],
          evidenceRefs: [`file://${testExecutionPath}`]
        }
      },
      null,
      2
    ),
    "utf8"
  );
  writeFileSync(
    testExecutionPath,
    [
      "# Test Execution Result Surface",
      "",
      "```",
      "[error] .../DiagnosticsFinalizeSpec.scala:14:42: type mismatch;",
      "[error]  found   : cdme.compiler.diagnostics.CompileDiagnostic",
      "[error]  required: DiagnosticsFinalizeSpec.this.AWord",
      "[error] .../DiagnosticsFinalizeSpec.scala:53:14: Cannot prove that Int <:< AnyRef.",
      "[error]     out.size shouldBe in.size",
      "```"
    ].join("\n"),
    "utf8"
  );
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const reason = "component_repair_row_open:fail.compiler.diagnostics.scalac.001";
  const evidenceRefs = [`file://${releaseDepthPath}`, `file://${testExecutionPath}`];
  return deriveWorkerHandoffManifest({
    workspaceRoot: root,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 22,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: "derive_release_depth_parity_surface",
          vectorIndex: 31,
          targetAssetType: "release_depth_parity_surface",
          reasons: [
            {
              kind: "sdlc_postflight_gap_reason",
              reason,
              reasonClass: "assurance",
              blockingReason: {
                ...sdlcBlockingReasonFromLegacy({ reason }),
                code: "edge_closure_residual_pressure",
                reasonClass: "assurance",
                message: "Edge closure residual pressure requires same-edge repair.",
                detail: reason,
                evidenceRefs,
                lawfulReentryPoint: "repair_worker_output"
              }
            }
          ],
          evidenceRefs,
          priorManifestId: "file:///tmp/t120/release-depth-handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t120/release-depth-gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["repair_worker_output"]
        }
      ]
    },
    runId: "t120-component-repair-row-open"
  });
}

test("T-120 retry prompt projects exact schema-local carrier repair pressure", () => {
  const files = writeHandoffFiles(retryManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");
  const [instruction] = invocationPackage.retryRepairInstructions;

  assert(instruction);
  assert.equal(instruction.kind, "sdlc_worker_retry_repair_instruction");
  assert.equal(instruction.repairScope, "schema_local");
  assert.equal(
    instruction.reason,
    "component_depth_register_invalid:component_depth_register.componentRealizationRows[0].bindingId: unexpected field"
  );
  assert.equal(instruction.reasonClass, "assurance");
  assert.equal(
    instruction.acceptedCarrierSchemaRef,
    "schema://odd_sdlc/component_depth_register"
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "componentRealizationRows[].componentId"
    )
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "componentRealizationRows[].sourceAssetRefs"
    )
  );
  assert(
    instruction.rejectedArtifactRefs.includes(
      "file:///tmp/t120/component_code_surface.md"
    )
  );
  assert.match(prompt, /retryRepairInstructions and repairReentryPlans when present/u);
  assert.match(prompt, /Worker package fields to apply/u);
});

test("T-188 retry prompt does not assign non-retryable triage gaps to F_P repair", () => {
  const files = writeHandoffFiles(nonRetryableReviewGradeTriageManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");

  assert.deepEqual(invocationPackage.retryRepairInstructions, []);
  assert.doesNotMatch(prompt, /Evaluated residual pressure:/u);
  assert.doesNotMatch(prompt, /Repair these concrete evaluator blockers/u);
  assert.match(prompt, /non-retryable control-plane or operator-triage pressure/u);
  assert.match(prompt, /retryEligible=false/u);
});

test("T-158 retry frontier drops stale blockers repaired by the latest dossier", () => {
  const first = retryDossierWithReasons("file:///tmp/t120/gap-1.json", [
    "obligation_assessment_blocked:requirement:workspace.mapper_requirements.req_acc_001",
    "obligation_assessment_blocked:requirement:workspace.mapper_requirements.req_acc_002"
  ]);
  const latest = retryDossierWithReasons("file:///tmp/t120/gap-2.json", [
    "obligation_assessment_blocked:requirement:workspace.mapper_requirements.req_acc_002"
  ]);

  const [compact] = compactSdlcPriorGapDossiersForRetryContext([first, latest]);

  assert(compact);
  assert.equal(compact.currentGapDossierRef, latest.currentGapDossierRef);
  assert.deepEqual(
    compact.reasons.map((reason) => reason.reason),
    [
      "obligation_assessment_blocked:requirement:workspace.mapper_requirements.req_acc_002"
    ]
  );
  assert.deepEqual(compact.evidenceRefs, [
    first.currentGapDossierRef,
    latest.currentGapDossierRef
  ]);
});

test("T-164 retry frontier preserves distinct same-code evaluated blockers", () => {
  const first = retryDossierWithReasons("file:///tmp/t164/gap-1.json", [
    "materialized_product_requirement_lineage_missing"
  ]);
  const latestRef = "file:///tmp/t164/gap-2.json";
  const details = [
    "cdme-assurance/src/main/scala/cdme/assurance/DataProfiler.scala: unrelated:requirement:workspace.stage_03_ai_requirements.req_dq_004",
    "cdme-engine/src/main/scala/cdme/engine/LateArrivalHandler.scala: unrelated:requirement:workspace.stage_13_pdm_requirements.req_pdm_006",
    "cdme-executor/src/main/scala/cdme/executor/ArtifactVersionStore.scala: unrelated:requirement:workspace.stage_05_cov_requirements.req_trv_005_b",
    "cdme-executor/src/main/scala/cdme/executor/RunManifestManager.scala: unrelated:requirement:workspace.stage_03_ai_requirements.req_trv_005_a"
  ];
  const latest = {
    ...retryDossierWithReasons(latestRef, []),
    edgeName: "derive_component_code_surface",
    vectorIndex: 14,
    targetAssetType: "component_code_surface",
    reasons: details.map((detail) => ({
      kind: "sdlc_postflight_gap_reason",
      reason: "materialized_product_requirement_lineage_missing",
      reasonClass: "missing_evidence",
      blockingReason: {
        ...sdlcBlockingReasonFromLegacy({
          reason: "materialized_product_requirement_lineage_missing"
        }),
        code: "materialized_product_requirement_lineage_missing",
        reasonClass: "missing_evidence",
        lawfulReentryPoint: "same_edge_retry",
        message:
          "Materialized product evidence does not satisfy the product contract.",
        detail,
        evidenceRefs: [latestRef]
      }
    }))
  };

  const [compact] = compactSdlcPriorGapDossiersForRetryContext([first, latest]);

  assert(compact);
  assert.equal(compact.currentGapDossierRef, latest.currentGapDossierRef);
  assert.equal(compact.reasons.length, details.length);
  assert.deepEqual(
    compact.reasons.map((reason) => reason.blockingReason.detail),
    details
  );
});

test("T-164 retry prompt names current evaluated requirement gaps", () => {
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const reasons = [
    "obligation_assessment_blocked:requirement:workspace.requirements.req_dq_003",
    "obligation_assessment_blocked:requirement:workspace.stage_15_trv_requirements.req_trv_005_b",
    "edge_closure_residual_pressure:obligation://odd-sdlc/requirement%3Aworkspace.requirements.req_pdm_006/blocked"
  ];
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 14,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: contract.edgeName,
          vectorIndex: 14,
          targetAssetType: "component_code_surface",
          reasons: reasons.map((reason) => ({
            kind: "sdlc_postflight_gap_reason",
            reason,
            reasonClass: "assurance",
            blockingReason: {
              ...sdlcBlockingReasonFromLegacy({ reason }),
              code: "edge_closure_residual_pressure",
              reasonClass: "assurance",
              message: "Edge closure residual pressure requires same-edge repair.",
              detail: reason,
              evidenceRefs: ["file:///tmp/t164/fp_evaluate_result.json"],
              lawfulReentryPoint: "repair_worker_output"
            }
          })),
          evidenceRefs: ["file:///tmp/t164/gap_dossier.json"],
          priorManifestId: "file:///tmp/t164/handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t164/gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["repair_worker_output"]
        }
      ]
    },
    runId: "t164-current-evaluated-gaps"
  });
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");

  assert.match(prompt, /Current evaluated gaps:/u);
  assert.match(prompt, /These are your current evaluated gaps/u);
  assert.match(
    prompt,
    /requirementTraceObligationIds as the prompt-visible required product-file requirement tag set/u
  );
  assert.match(
    prompt,
    /For every declared product file target with role source, test, or build_config that supports an active requirement, embed parseable requirement tags/u
  );
  assert.match(
    prompt,
    /canonical ids already include the `requirement:` prefix/u
  );
  assert.doesNotMatch(prompt, /\/\/ requirement:<canonical-id>/u);
  assert.match(prompt, /Build_config files are not exempt/u);
  assert.match(
    prompt,
    /For product files that cannot carry native comments, such as strict structured configuration files, carry lineage in the target carrier\/table/u
  );
  assert.match(
    prompt,
    /Current evaluated gaps are also admissible repair tags/u
  );
  assert.doesNotMatch(prompt, /complete product-file requirement tag set/u);
  assert.match(prompt, /gapDossierRef: file:\/\/\/tmp\/t164\/gap_dossier\.json/u);
  assert.match(prompt, /requirement:workspace\.requirements\.req_dq_003/u);
  assert.match(
    prompt,
    /requirement:workspace\.stage_15_trv_requirements\.req_trv_005_b/u
  );
  assert.match(prompt, /requirement:workspace\.requirements\.req_pdm_006/u);
  assert.doesNotMatch(prompt, /requirement:Aworkspace/u);
  assert.match(prompt, /edge_closure_residual_pressure/u);
  assert.doesNotMatch(prompt, /assurance_ledger_reason/u);
  assert.match(prompt, /file:\/\/\/tmp\/t164\/fp_evaluate_result\.json/u);
});

test("T-188 retry trace evidence does not become product-file requirement lineage", () => {
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const traceRef =
    "file:///tmp/t188/operator-runs/run/worker_process_events.jsonl.trace/result.json";
  const detail = [
    "materialized_product_requirement_lineage_missing:",
    "src/hello.js: requirement:t120_retry_local_repair.requirements.req_t120_001;",
    `traceResultRef=${traceRef}`
  ].join("");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 14,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: contract.edgeName,
          vectorIndex: 14,
          targetAssetType: "component_code_surface",
          reasons: [
            {
              kind: "sdlc_postflight_gap_reason",
              reason: detail,
              reasonClass: "missing_evidence",
              blockingReason: {
                ...sdlcBlockingReasonFromLegacy({
                  reason: "materialized_product_requirement_lineage_missing"
                }),
                code: "materialized_product_requirement_lineage_missing",
                reasonClass: "missing_evidence",
                lawfulReentryPoint: "same_edge_retry",
                message:
                  "Materialized product evidence does not satisfy the product contract.",
                detail,
                evidenceRefs: [traceRef]
              }
            }
          ],
          evidenceRefs: [traceRef],
          priorManifestId: "file:///tmp/t188/handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t188/gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["retry_same_edge"]
        }
      ]
    },
    runId: "t188-runtime-trace-not-requirement-lineage"
  });
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");

  assert(
    invocationPackage.requirementTraceObligationIds.some((obligationId) =>
      obligationId.endsWith(".req_t120_001")
    )
  );
  assert(
    !invocationPackage.requirementTraceObligationIds.includes(
      "requirement:worker_process_events.jsonl.trace"
    )
  );
  assert.match(prompt, /worker_process_events\.jsonl\.trace/u);
  assert.doesNotMatch(prompt, /requirement:worker_process_events\.jsonl\.trace/u);
});

test("T-164 execution-environment retry prompt preserves test lineage", () => {
  const contract = hookContractByEdgeName("derive_component_test_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 19,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: contract.edgeName,
          vectorIndex: 19,
          targetAssetType: "component_test_surface",
          reasons: [
            {
              kind: "sdlc_postflight_gap_reason",
              reason:
                "review_grade_edge_fulfillment_blocked:target_asset:component_test_surface:execution_environment:sbt cannot resolve workspace-local launcher.",
              reasonClass: "execution_environment",
              blockingReason: {
                kind: "sdlc_blocking_reason",
                code: "review_grade_edge_fulfillment_blocked",
                reasonClass: "execution_environment",
                lawfulReentryPoint: "same_edge_retry",
                message: "Worker obligation assessment does not satisfy traversal pressure.",
                detail:
                  "target_asset:component_test_surface:execution_environment:sbt cannot resolve workspace-local launcher.",
                evidenceRefs: ["file:///tmp/t164/review_grade_edge_fulfillment_assessment.json"]
              }
            }
          ],
          evidenceRefs: ["file:///tmp/t164/review_grade_edge_fulfillment_assessment.json"],
          priorManifestId: "file:///tmp/t164/handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t164/gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["retry_same_edge"]
        }
      ]
    },
    runId: "t164-execution-environment-retry"
  });
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");

  assert.match(prompt, /execution-environment repair rule/u);
  assert.match(prompt, /Repair executable environment blockers through tenant stack authority/u);
  assert.match(
    prompt,
    /Do not remove tests, testcase ids, requirement ids, source-overlap rows, or lineage tags/u
  );
  assert.match(
    prompt,
    /existing testcaseIds, requirementIds, source-overlap rows, and test files are monotonic/u
  );
  assert.match(
    prompt,
    /never reduce the proof surface to make execution easier/u
  );
});

test("T-184 retry repair instructions consolidate residual pressure with bounded causal evidence", () => {
  const contract = hookContractByEdgeName("derive_requirement_surface");
  const reasonRefs = Array.from(
    { length: 1200 },
    (_, index) =>
      `obligation://odd-sdlc/requirement%3Aworkspace.requirements.req_${String(
        index
      ).padStart(3, "0")}/blocked`
  );
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 17,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: contract.edgeName,
          vectorIndex: 17,
          targetAssetType: "requirement_surface",
          reasons: reasonRefs.map((reasonRef) => ({
            kind: "sdlc_postflight_gap_reason",
            reason: `edge_closure_residual_pressure:${reasonRef}`,
            reasonClass: "assurance",
            blockingReason: {
              kind: "sdlc_blocking_reason",
              code: "edge_closure_residual_pressure",
              reasonClass: "assurance",
              lawfulReentryPoint: "same_edge_retry",
              message: "Edge closure residual pressure requires same-edge repair.",
              detail: reasonRef,
              evidenceRefs: [
                "closure-decision://odd-sdlc/t184/requirement-surface",
                reasonRef
              ]
            }
          })),
          evidenceRefs: [
            "file:///tmp/t184/review_grade_edge_fulfillment_assessment.json",
            "file:///tmp/t184/sdlc_edge_closure_decision.json",
            ...reasonRefs
          ],
          priorManifestId: "file:///tmp/t184/handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t184/gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["retry_same_edge"]
        }
      ]
    },
    runId: "t184-reason-local-retry-instructions"
  });
  const files = writeHandoffFiles(manifest);
  const invocationPackageText = readFileSync(files.invocationPackagePath, "utf8");
  const invocationPackage = JSON.parse(invocationPackageText);
  const prompt = readFileSync(files.promptPath, "utf8");

  assert.equal(invocationPackage.retryRepairInstructions.length, 1);
  assert.match(
    invocationPackage.retryRepairInstructions[0].blockingReasonDetail,
    /requiredResidualPressureRefCount=1200/u
  );
  assert.match(
    invocationPackage.retryRepairInstructions[0].blockingReasonDetail,
    /omittedRequiredPressureRefCount=960/u
  );
  assert.deepEqual(
    invocationPackage.retryRepairInstructions[0].rejectedArtifactRefs.slice(0, 2),
    ["closure-decision://odd-sdlc/t184/requirement-surface", "file:///tmp/t184/gap_dossier.json"]
  );
  assert(
    !invocationPackage.retryRepairInstructions[0].rejectedArtifactRefs.includes(
      reasonRefs[reasonRefs.length - 1]
    )
  );
  assert(
    !invocationPackage.retryRepairInstructions[0].rejectedArtifactRefs.includes(
      "file:///tmp/t184/review_grade_edge_fulfillment_assessment.json"
    )
  );
  assert.match(prompt, /reasonCount=1; rawReasonCount=1200/u);
  assert.match(prompt, /requiredResidualPressureRefCount=1200/u);
  assert.match(prompt, /omittedRequiredPressureRefCount=960/u);
  assert.doesNotMatch(prompt, /omitted reason count: 56/u);
});

test("T-164 retry prompt uses review-grade blocked findings as the repair work queue", () => {
  const root = workspaceRoot();
  const contract = hookContractByEdgeName("derive_requirement_surface");
  const assessmentPath = path.join(root, "review_grade_edge_fulfillment_assessment.json");
  const blockedIds = [
    "requirement:data_mapper.requirements.req_dq_004",
    "requirement:data_mapper.requirements.req_trv_005_a",
    "requirement:data_mapper.requirements.req_trv_005_b"
  ];
  writeFileSync(
    assessmentPath,
    `${JSON.stringify(
      {
        kind: "sdlc_review_grade_edge_fulfillment_assessment",
        assessmentVersion: "ts-review-grade-v1",
        graphFunctionName: "bootstrap_release_self_test",
        edgeName: contract.edgeName,
        targetAssetType: "requirement_surface",
        status: "blocked",
        reviewedObligationIds: [
          "requirement:data_mapper.mapper_requirements.req_acc_001",
          ...blockedIds
        ],
        findings: [
          {
            kind: "sdlc_review_grade_obligation_finding",
            obligationId: "requirement:data_mapper.mapper_requirements.req_acc_001",
            fulfillmentStatus: "partial",
            failureClass: "wrong_stage",
            requiredAction: "Carry forward to downstream materialization.",
            evidenceRefs: [],
            acceptedAuthorityRefs: [],
            fulfillmentBinding: null,
            rationale: "Downstream carryover."
          },
          ...blockedIds.map((obligationId) => ({
            kind: "sdlc_review_grade_obligation_finding",
            obligationId,
            fulfillmentStatus: "blocked",
            failureClass: "trace_missing",
            requiredAction: "Add explicit requirement-surface lineage.",
            evidenceRefs: [],
            acceptedAuthorityRefs: [],
            fulfillmentBinding: null,
            rationale: "Trace missing."
          }))
        ],
        evidenceRefs: [],
        summary: "blocked"
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: root,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 17,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: contract.edgeName,
          vectorIndex: 17,
          targetAssetType: "requirement_surface",
          reasons: [
            {
              kind: "sdlc_postflight_gap_reason",
              reason:
                "review_grade_edge_fulfillment_blocked:requirement:data_mapper.mapper_requirements.req_acc_001:wrong_stage:Carry forward.",
              reasonClass: "assurance",
              blockingReason: {
                kind: "sdlc_blocking_reason",
                code: "review_grade_edge_fulfillment_blocked",
                reasonClass: "assurance",
                lawfulReentryPoint: "same_edge_retry",
                message: "Worker obligation assessment does not satisfy traversal pressure.",
                detail:
                  "requirement:data_mapper.mapper_requirements.req_acc_001:wrong_stage:Carry forward.",
                evidenceRefs: [pathToFileURL(assessmentPath).href]
              }
            }
          ],
          evidenceRefs: [pathToFileURL(assessmentPath).href],
          priorManifestId: "file:///tmp/t164/handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t164/gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["retry_same_edge"]
        }
      ]
    },
    runId: "t164-review-grade-blocked-work-queue"
  });
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");
  const invocationPackage = JSON.parse(readFileSync(files.invocationPackagePath, "utf8"));
  assert.match(
    prompt,
    /Use the listed blocker rows as the retry authority packet; repair the contracted artifact surface before inspecting broader SDLC context\./u
  );
  assert.doesNotMatch(
    prompt,
    /Rank retry work|contextual closure priority|common-library foundations/u
  );
  const workQueue = prompt.match(
    /- blocked requirement obligations:\n(?<rows>(?:  - .+\n)+)- retry coverage contract:/u
  )?.groups?.rows;

  assert(workQueue);
  for (const id of blockedIds) {
    assert.match(workQueue, new RegExp(id.replaceAll(".", "\\."), "u"));
  }
  assert.doesNotMatch(workQueue, /requirement:data_mapper\.mapper_requirements\.req_acc_001/u);
  assert.deepEqual(invocationPackage.requirementTraceObligationIds.slice(0, 3), blockedIds);
});

test("T-164 retry prompt preserves workspace-relative diagnostic paths", () => {
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const detail =
    "cdme-executor/src/main/scala/cdme/executor/RunManifestManager.scala: unrelated:requirement:workspace.stage_03_ai_requirements.req_trv_005_a";
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspaceRoot(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 14,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [
        {
          kind: "sdlc_postflight_gap_dossier",
          status: "open",
          graphFunctionName: "bootstrap_release_self_test",
          edgeName: contract.edgeName,
          vectorIndex: 14,
          targetAssetType: "component_code_surface",
          reasons: [
            {
              kind: "sdlc_postflight_gap_reason",
              reason: "materialized_product_requirement_lineage_missing",
              reasonClass: "missing_evidence",
              blockingReason: {
                ...sdlcBlockingReasonFromLegacy({
                  reason: "materialized_product_requirement_lineage_missing"
                }),
                code: "materialized_product_requirement_lineage_missing",
                reasonClass: "missing_evidence",
                lawfulReentryPoint: "same_edge_retry",
                message:
                  "Materialized product evidence does not satisfy the product contract.",
                detail,
                evidenceRefs: ["file:///tmp/t164/gap_dossier.json"]
              }
            }
          ],
          evidenceRefs: ["file:///tmp/t164/gap_dossier.json"],
          priorManifestId: "file:///tmp/t164/handoff_manifest.json",
          currentGapDossierRef: "file:///tmp/t164/gap_dossier.json",
          retryEligible: true,
          nextLawfulActions: ["retry_same_edge"]
        }
      ]
    },
    runId: "t164-current-evaluated-relative-paths"
  });
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");

  assert.match(
    prompt,
    /cdme-executor\/src\/main\/scala\/cdme\/executor\/RunManifestManager\.scala/u
  );
  assert.doesNotMatch(prompt, /outside-workspace-path:RunManifestManager\.scala/u);
});

test("T-120 component carrier retry instructions fail closed if schema fields are omitted", () => {
  const files = writeHandoffFiles(retryManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const [instruction] = invocationPackage.retryRepairInstructions;

  assert(instruction);
  assert.equal(instruction.repairScope, "schema_local");
  assert.notEqual(instruction.acceptedCarrierSchemaRef, null);
  assert(instruction.acceptedCarrierFieldSet.length >= 10);
});

test("T-120 retry prompts redact outside-workspace diagnostic paths", () => {
  const files = writeHandoffFiles(outsidePathRetryManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");
  const [instruction] = invocationPackage.retryRepairInstructions;
  const directives = invocationPackage.outcomeDirectives.join("\n");

  assert(instruction);
  assert.doesNotMatch(directives, /\/Users\/jim\/src\/apps/u);
  assert.doesNotMatch(instruction.reason, /\/Users\/jim\/src\/apps/u);
  assert.doesNotMatch(instruction.blockingReasonDetail, /\/Users\/jim\/src\/apps/u);
  assert.match(directives, /\[outside-workspace-path:src\]/u);
  assert.match(instruction.blockingReasonDetail, /\[outside-workspace-path:src\]/u);
  assert.doesNotMatch(prompt, /\/Users\/jim\/src\/apps/u);
});

test("T-120 component realization schedule prompt publishes admitted row schema", () => {
  const files = writeHandoffFiles(componentRealizationManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");

  assert(
    invocationPackage.outcomeDirectives.some((directive) =>
      directive.includes(
        "componentRealizationRows with kind=sdlc_component_realization_row"
      )
    )
  );
  assert(
    invocationPackage.outcomeDirectives.some((directive) =>
      directive.includes("sourceAssetRefs")
    )
  );
  assert.match(prompt, /componentRealizationRows with kind=sdlc_component_realization_row/u);
  assert.match(prompt, /sourceAssetRefs/u);
});

test("T-120 component topology prompt declares publicBoundary as a string field", () => {
  const files = writeHandoffFiles(designRetryManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");
  const [instruction] = invocationPackage.retryRepairInstructions;

  assert(
    invocationPackage.outcomeDirectives.some((directive) =>
      directive.includes("sdlc_component_topology_row")
    )
  );
  assert(instruction);
  assert(
    instruction.acceptedCarrierFieldSet.includes("componentTopologyRows[].publicBoundary")
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes("componentTopologyRows[].concernRole")
  );
  assert.match(
    prompt,
    /componentTopologyRows\[\]\.componentId\/moduleName\/relativePath\/publicBoundary\/concernRole/u
  );
});

test("T-120 design-depth retries carry nested canonical attribute fields", () => {
  const files = writeHandoffFiles(designRetryManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");
  const [instruction] = invocationPackage.retryRepairInstructions;

  assert(instruction);
  assert.equal(instruction.repairScope, "schema_local");
  assert.equal(
    instruction.acceptedCarrierSchemaRef,
    "schema://odd_sdlc/design_depth_register"
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "moduleSchemaFragments[].entities[].attributes[].name"
    )
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "moduleSchemaFragments[].entities[].attributes[].valueType"
    )
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "aggregateSunnyDaySequence.steps[].stepId"
    )
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "aggregateSunnyDaySequence.steps[].moduleName"
    )
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "designCompletenessVerdict.flow.status"
    )
  );
  assert(
    !instruction.acceptedCarrierFieldSet.includes(
      "aggregateSunnyDaySequence.steps[].actor"
    )
  );
  assert(
    !instruction.acceptedCarrierFieldSet.includes(
      "moduleSchemaFragments[].entities[].attributes[].type"
    )
  );
  assert.match(prompt, /retryRepairInstructions and repairReentryPlans when present/u);
});

test("T-120 design attribute repair retries carry the design-depth carrier schema", () => {
  const files = writeHandoffFiles(designAttributeMissingRetryManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");
  const [instruction] = invocationPackage.retryRepairInstructions;

  assert(instruction);
  assert.equal(instruction.repairScope, "semantic_local");
  assert.equal(
    instruction.acceptedCarrierSchemaRef,
    "schema://odd_sdlc/design_depth_register"
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "moduleSchemaFragments[].entities[].attributes[].valueType"
    )
  );
  assert(
    instruction.nonClosureRules.some((rule) =>
      rule.includes("Add, remove, rename, or map")
    )
  );
  assert.match(prompt, /retryRepairInstructions and repairReentryPlans when present/u);
});

test("T-120 execution-evidence retries carry the accepted JSON carrier schema", () => {
  const files = writeHandoffFiles(executionRetryManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");
  const [instruction] = invocationPackage.retryRepairInstructions;

  assert(instruction);
  assert.equal(instruction.repairScope, "schema_local");
  assert.equal(
    instruction.acceptedCarrierSchemaRef,
    "schema://odd_sdlc/test_execution_evidence"
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes("shardEvidence[].shardId")
  );
  assert.match(prompt, /retryRepairInstructions and repairReentryPlans when present/u);
});

test("T-120 repair-schedule semantic retries carry strict component carrier repair law", () => {
  const files = writeHandoffFiles(repairScheduleRetryManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");
  const [instruction] = invocationPackage.retryRepairInstructions;

  assert(instruction);
  assert.equal(instruction.repairScope, "semantic_local");
  assert.equal(
    instruction.acceptedCarrierSchemaRef,
    "schema://odd_sdlc/component_depth_register"
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "componentRepairSchedule.repairRows[].repairTarget"
    )
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "componentRepairSchedule.repairRows[].componentIds"
    )
  );
  assert.match(prompt, /retryRepairInstructions and repairReentryPlans when present/u);
});

test("B-085 component repair row open becomes typed component-test repair reentry law", () => {
  const files = writeHandoffFiles(componentRepairRowOpenRetryManifest());
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const prompt = readFileSync(files.promptPath, "utf8");
  const [instruction] = invocationPackage.retryRepairInstructions;
  const [plan] = invocationPackage.repairReentryPlans;

  assert(instruction);
  assert(plan);
  assert.equal(instruction.repairScope, "semantic_local");
  assert.equal(plan.targetEdgeName, "derive_component_test_surface");
  assert.equal(plan.targetAssetType, "component_test_surface");
  assert.equal(plan.repairTarget, "component_test");
  assert.equal(plan.failureId, "fail.compiler.diagnostics.scalac.001");
  assert.equal(plan.scheduleId, "schedule.compiler.diagnostics.scalac.001");
  assert.equal(plan.noBroadRegeneration, true);
  assert(
    plan.testRefs.includes(
      "build_tenants/scala_spark/cdme-compiler/src/test/scala/cdme/compiler/diagnostics/DiagnosticsFinalizeSpec.scala"
    )
  );
  assert.match(plan.diagnosticExcerpt, /type mismatch/u);
  assert.match(plan.diagnosticExcerpt, /Cannot prove that Int <:< AnyRef/u);
  assert.equal(
    instruction.acceptedCarrierSchemaRef,
    "schema://odd_sdlc/component_depth_register"
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes(
      "componentTestRows[].relativePath"
    )
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes("componentTopologyRows=[]")
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes("componentRepairSchedule=null")
  );
  assert.match(prompt, /do not copy source componentTopologyRows/u);
  assert.equal(
    instruction.repairReentryPlanId,
    "component_repair_reentry:fail.compiler.diagnostics.scalac.001"
  );
  assert.equal(instruction.repairReentryPlanId, plan.planId);
  assert(
    instruction.nonClosureRules.some((rule) =>
      rule.includes("Do not broadly regenerate")
    )
  );
  assert.match(prompt, /retryRepairInstructions and repairReentryPlans when present/u);
  assert.match(prompt, /Worker package fields to apply/u);
});

test("T-120 Spec Method entry does not own installed retry control", () => {
  const packageRoot = process.cwd();
  assert.equal(
    existsSync(path.join(packageRoot, "code/src/cli/command.ts")),
    false
  );
  const entry = readFileSync(
    path.join(packageRoot, "code/src/spec_method/entry.ts"),
    "utf8"
  );
  const installedOperator = readFileSync(
    path.join(packageRoot, "code/src/operator/installed_operator.ts"),
    "utf8"
  );

  assert(!entry.includes("retryContextOverride"));
  assert(!entry.includes("MAX_INSTALLED_START_SELF_HEAL_ATTEMPTS"));
  assert(!entry.includes("sdlc_installed_operator_start_loop_attempt"));
  assert(!installedOperator.includes("executeInstalledOperatorStartWithReentry"));
  assert(!installedOperator.includes("sdlc_installed_operator_start_loop"));
  assert.match(installedOperator, /sdlcOperatorRuntimePolicy/u);
  assert(!installedOperator.includes("installedRetryReentryAttemptLimits"));
  assert(!installedOperator.includes("installedReentryAttemptLimit"));
  assert(!installedOperator.includes("MAX_INSTALLED_RETRY_REENTRY_ATTEMPTS"));
});
