// Validates: T-188

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  componentRepairReentryPlansForGapDossier,
  componentDepthResidualPressureRefs,
  constructSdlcEdgeFulfillmentLedger,
  deriveSdlcEdgeAssuranceCloseDecision,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeFulfillmentCountsFromAssessments,
  sdlcFpEvaluateOpenObligationPressureRefs
} from "../../build/semantic/code/src/index.js";

const evaluatorPromptSource = readFileSync(
  fileURLToPath(
    new URL("../../code/src/operator/plugins/evaluate/prompts.ts", import.meta.url)
  ),
  "utf8"
);

const SELECTED_COMPOSITION = Object.freeze({
  compositionRef: "composition://odd-sdlc/t188/test",
  compositionDigest: "sha256:t188-test-composition",
  compositionSelectionRef: "composition-selection://odd-sdlc/t188/test",
  selectedRegimeBindingRef: "regime-binding://odd-sdlc/t188/evaluate/fp"
});

function closeDecisionWithPressure(pressureRefs) {
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: SELECTED_COMPOSITION,
    ledgerRef: "ledger://odd-sdlc/t188/fp-open-obligation",
    ledgerVersionRef: "ledger-version://odd-sdlc/t188/fp-open-obligation/1",
    edgeRef: "edge://odd-sdlc/t188/derive_test_execution_result_surface",
    attemptRef: "attempt://odd-sdlc/t188/derive_test_execution_result_surface/1",
    targetBindingRefs: ["target-binding://odd-sdlc/t188/test-execution"],
    evidenceBundleRefs: ["evidence://odd-sdlc/t188/test-execution"],
    edgeResidualPressureRefs: pressureRefs,
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    },
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true
  });
  return deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t188/fp-open-obligation",
    ledger,
    currentEdgeLawful: true
  });
}

function assuranceDecisionWithPressure(pressureRefs) {
  return deriveSdlcEdgeAssuranceCloseDecision({
    gain: {
      contractRef: "closure://odd-sdlc/t188",
      contractDigest: "sha256:t188-closure-contract",
      edgeRef: "edge://odd-sdlc/t188/derive_component_repair_schedule_surface",
      gainRef: "edge-gain://odd-sdlc/t188",
      metricFunctionRef: "metric://odd-sdlc/t188",
      closureFunctionRef: "closure-function://odd-sdlc/t188",
      targetCarrierContractRef:
        "gtl://target-carrier-contract/odd-sdlc/derive_component_repair_schedule_surface/component_repair_schedule_surface",
      targetCarrierContractDigest: "sha256:t188-target-carrier",
      targetCarrierAdmissionStatus: "admitted",
      obligationsAndLedgersComplete: true,
      missingLedgerInputKinds: []
    },
    residualPressure: {
      kind: "sdlc_edge_residual_pressure",
      pressureRef: "pressure://odd-sdlc/t188/component-repair-triage",
      clear: pressureRefs.length === 0,
      requiredPressureRefs: pressureRefs,
      informationalPressureRefs: []
    }
  });
}

function emptyComponentDepthRegister(targetAssetType, patch = {}) {
  return {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType,
    componentTopologyRows: [],
    componentRealizationRows: [],
    testComponentTopologyRows: [],
    componentTestRows: [],
    componentTestQualificationRows: [],
    componentExecutionFailureRegister: null,
    componentRepairSchedule: null,
    releaseDepthParity: null,
    ...patch
  };
}

function admittedComponentDepthRegister(targetAssetType, register) {
  return {
    kind: "sdlc_component_depth_register_admission",
    status: "admitted",
    targetAssetType,
    register,
    blockingReasons: [],
    evidenceRefs: [`evidence://odd-sdlc/t188/${targetAssetType}`]
  };
}

test("T-188 downstream carry cannot erase partial pressure without owned downstream refs", () => {
  const projection = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: ["requirement:REQ-DM-LITE-001"],
    assessments: [
      {
        obligationId: "requirement:REQ-DM-LITE-001",
        fulfillmentStatus: "partial",
        carryDirection: "downstream_transformation_set",
        evidenceRefs: ["evaluation://odd-sdlc/t188/fp-depth-gap"]
      }
    ]
  });

  assert.deepStrictEqual(projection.counts, {
    expected: 1,
    fulfilled: 0,
    partial: 1,
    blocked: 0,
    unfulfilled: 0,
    missing: 0,
    extra: 0
  });
  assert.deepStrictEqual(projection.downstreamTransformationSetRefs, []);
  assert(
    projection.nonConvergedReasonRefs.some((ref) =>
      ref.includes("downstream_ownership_missing")
    ),
    projection.nonConvergedReasonRefs.join("\n")
  );
});

test("T-188 downstream carry remains lawful when graph and target ownership are explicit", () => {
  const projection = deriveSdlcEdgeFulfillmentCountsFromAssessments({
    declaredObligationIds: ["requirement:REQ-DM-LITE-002"],
    assessments: [
      {
        obligationId: "requirement:REQ-DM-LITE-002",
        fulfillmentStatus: "partial",
        carryDirection: "downstream_transformation_set",
        downstreamGraphFunctionRefs: [
          "graph-function://odd-sdlc/derive_component_test_surface"
        ],
        targetBindingRefs: [
          "target-binding://odd-sdlc/t188/component-test-surface"
        ],
        evidenceRefs: ["evaluation://odd-sdlc/t188/fp-depth-gap"]
      }
    ]
  });

  assert.deepStrictEqual(projection.counts, {
    expected: 0,
    fulfilled: 0,
    partial: 0,
    blocked: 0,
    unfulfilled: 0,
    missing: 0,
    extra: 0
  });
  assert.equal(projection.downstreamTransformationSetRefs.length, 1);
  assert.equal(projection.downstreamPressureRefs.length, 3);
  assert.equal(projection.downstreamTargetBindingRefs.length, 1);
  assert.deepStrictEqual(projection.nonConvergedReasonRefs, []);
});

test("T-188 admitted F_P evaluate open obligations become closure pressure", () => {
  const pressureRefs = sdlcFpEvaluateOpenObligationPressureRefs({
    runRef: "20260601T000000000Z_pid188",
    status: "admitted_with_open_obligations",
    obligationAssessmentCounts: {
      total: 199,
      fulfilled: 49,
      partial: 150,
      blocked: 0,
      unassessed: 0
    }
  });

  assert(pressureRefs.length > 0);
  assert(
    pressureRefs.some((ref) => ref.includes("admitted_with_open_obligations")),
    pressureRefs.join("\n")
  );
  assert(
    pressureRefs.some((ref) => ref.includes("partial-150")),
    pressureRefs.join("\n")
  );

  const decision = closeDecisionWithPressure(pressureRefs);
  assert.notEqual(decision.disposition, "close");
  assert.deepStrictEqual(decision.edgeResidualPressureRefs, pressureRefs);
});

test("T-188 downstream carryover partials do not become edge-local closure pressure", () => {
  const pressureRefs = sdlcFpEvaluateOpenObligationPressureRefs({
    runRef: "20260601T000000000Z_pid188",
    status: "admitted_with_open_obligations",
    obligationAssessmentCounts: {
      total: 3,
      fulfilled: 1,
      partial: 2,
      blocked: 0,
      unassessed: 0
    },
    obligationAssessments: [
      {
        fulfillmentStatus: "fulfilled",
        blockingReasons: []
      },
      {
        fulfillmentStatus: "partial",
        blockingReasons: [
          "requirement_recorded_for_future_closure:data_mapper_lite_lifecycle.requirements.req_ldm_001"
        ]
      },
      {
        fulfillmentStatus: "partial",
        blockingReasons: [
          "requirement_carried_for_downstream_closure:data_mapper_lite_lifecycle.requirements.req_ldm_002"
        ]
      }
    ]
  });

  assert.deepStrictEqual(pressureRefs, []);
});

test("T-188 review-grade downstream carryover overrides stale pre-review F_P counts", () => {
  const pressureRefs = sdlcFpEvaluateOpenObligationPressureRefs({
    runRef: "20260601T000000000Z_pid188",
    status: "admitted_with_open_obligations",
    obligationAssessmentCounts: {
      total: 3,
      fulfilled: 1,
      partial: 0,
      blocked: 2,
      unassessed: 0
    },
    obligationAssessments: [
      {
        fulfillmentStatus: "fulfilled",
        blockingReasons: []
      },
      {
        fulfillmentStatus: "partial",
        blockingReasons: [
          "requirement_carried_for_downstream_closure:data_mapper.requirements.req_acc_001"
        ]
      },
      {
        fulfillmentStatus: "partial",
        blockingReasons: [
          "requirement_recorded_for_future_closure:data_mapper.requirements.req_trv_001"
        ]
      }
    ]
  });

  assert.deepStrictEqual(pressureRefs, []);
});

test("T-188 component repair triage gap becomes closure pressure", () => {
  const pressureRefs = componentDepthResidualPressureRefs({
    runRef: "20260601T000000000Z_pid188",
    admission: admittedComponentDepthRegister(
      "component_repair_schedule_surface",
      emptyComponentDepthRegister("component_repair_schedule_surface", {
        componentRepairSchedule: {
          kind: "sdlc_component_repair_schedule",
          registerVersion: "ts-component-depth-v1",
          scheduleStatus: "triage_gap",
          repairRows: [],
          evidenceRefs: ["evidence://odd-sdlc/t188/repair-triage-gap"]
        }
      })
    )
  });

  assert(pressureRefs.length > 0);
  assert(
    pressureRefs.some((ref) =>
      ref.includes("component_repair_schedule_triage_gap")
    ),
    pressureRefs.join("\n")
  );

  const decision = closeDecisionWithPressure(pressureRefs);
  assert.notEqual(decision.disposition, "close");

  const assuranceDecision = assuranceDecisionWithPressure(pressureRefs);
  assert.equal(assuranceDecision.disposition, "block");
});

test("T-188 component repair schedule rows route to repair reentry", () => {
  const pressureRefs = componentDepthResidualPressureRefs({
    runRef: "20260601T000000000Z_pid188",
    admission: admittedComponentDepthRegister(
      "component_repair_schedule_surface",
      emptyComponentDepthRegister("component_repair_schedule_surface", {
        componentRepairSchedule: {
          kind: "sdlc_component_repair_schedule",
          registerVersion: "ts-component-depth-v1",
          scheduleStatus: "repair_required",
          repairRows: [
            {
              kind: "sdlc_component_repair_schedule_row",
              scheduleId: "schedule:repair-required",
              failureId: "failure:TD-LDM-GRAPH:node-test-topology",
              repairTarget: "test_execution_surface",
              lawfulReentryPoint: "repair_worker_output",
              attributionConfidence: "high",
              testcaseIds: ["testcase:TD-LDM-GRAPH"],
              componentIds: ["component:node-test-topology"],
              requirementIds: ["requirement:req_ldm_001"],
              sourceRefs: ["workspace://src/topology.js"],
              testRefs: ["workspace://test/topology.test.js"],
              evidenceRefs: ["evidence://odd-sdlc/t188/repair-row"]
            }
          ],
          evidenceRefs: ["evidence://odd-sdlc/t188/repair-required"]
        }
      })
    )
  });

  assert(
    pressureRefs.some((ref) =>
      ref.includes(
        "component_repair_schedule_row%3Afailure%3ATD-LDM-GRAPH%3Anode-test-topology"
      )
    ),
    pressureRefs.join("\n")
  );

  const assuranceDecision = assuranceDecisionWithPressure(pressureRefs);
  assert.equal(assuranceDecision.disposition, "block");

  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: SELECTED_COMPOSITION,
    ledgerRef: "ledger://odd-sdlc/t188/component-repair-schedule",
    ledgerVersionRef:
      "ledger-version://odd-sdlc/t188/component-repair-schedule/1",
    edgeRef: "edge://odd-sdlc/t188/derive_component_repair_schedule_surface",
    attemptRef: "attempt://odd-sdlc/t188/component-repair-schedule/1",
    targetBindingRefs: ["target-binding://odd-sdlc/t188/component-repair-schedule"],
    evidenceBundleRefs: ["evidence://odd-sdlc/t188/component-repair-schedule"],
    edgeAssuranceContractRef: assuranceDecision.contractRef,
    edgeAssuranceContractDigest: assuranceDecision.contractDigest,
    targetCarrierContractRef: assuranceDecision.targetCarrierContractRef,
    targetCarrierContractDigest: assuranceDecision.targetCarrierContractDigest,
    targetCarrierAdmissionStatus:
      assuranceDecision.targetCarrierAdmissionStatus,
    edgeGainRef: assuranceDecision.gainRef,
    edgeResidualPressureRefs: pressureRefs,
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    },
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://odd-sdlc/t188/component-repair-schedule",
    ledger,
    edgeAssuranceCloseDecision: assuranceDecision,
    currentEdgeLawful: true,
    repairReasonRefs: pressureRefs
  });

  assert.equal(decision.disposition, "repair");
});

test("T-188 repair reentry planner reads current repair schedule output", () => {
  const workspaceRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t188-repair-"));
  try {
    const outputFile = path.join(workspaceRoot, "component_repair_schedule_surface.md");
    writeFileSync(
      outputFile,
      JSON.stringify(
        emptyComponentDepthRegister("component_repair_schedule_surface", {
          componentRepairSchedule: {
            kind: "sdlc_component_repair_schedule",
            registerVersion: "ts-component-depth-v1",
            scheduleStatus: "repair_required",
            repairRows: [
              {
                kind: "sdlc_component_repair_schedule_row",
                scheduleId: "schedule:repair-required",
                failureId: "failure:TD-LDM-GRAPH:node-test-topology",
                repairTarget: "test_execution_surface",
                lawfulReentryPoint: "repair_worker_output",
                attributionConfidence: "high",
                testcaseIds: ["testcase:TD-LDM-GRAPH"],
                componentIds: ["component:node-test-topology"],
                requirementIds: ["requirement:req_ldm_001"],
                sourceRefs: ["workspace://src/topology.js"],
                testRefs: ["workspace://test/topology.test.js"],
                evidenceRefs: ["evidence://odd-sdlc/t188/repair-row"]
              }
            ],
            evidenceRefs: ["evidence://odd-sdlc/t188/repair-required"]
          }
        }),
        null,
        2
      ),
      "utf8"
    );
    const dossier = {
      kind: "sdlc_postflight_gap_dossier",
      status: "open",
      graphFunctionName: "derive_component_repair_schedule_surface",
      edgeName: "derive_component_repair_schedule_surface",
      vectorIndex: 0,
      targetAssetType: "component_repair_schedule_surface",
      reasons: [
        {
          kind: "sdlc_postflight_gap_reason",
          reason: "component_repair_row_open:failure:TD-LDM-GRAPH:node-test-topology",
          reasonClass: "assurance",
          blockingReason: {
            kind: "sdlc_blocking_reason",
            code: "edge_closure_residual_pressure",
            reasonClass: "assurance",
            lawfulReentryPoint: "repair_worker_output",
            message: "Component repair schedule residual pressure requires repair re-entry.",
            detail:
              "pressure://odd-sdlc/component-depth/run/component_repair_schedule_row%3Afailure%3ATD-LDM-GRAPH%3Anode-test-topology",
            evidenceRefs: [
              "closure-decision://odd-sdlc/t188/component-repair-schedule",
              "pressure://odd-sdlc/component-depth/run/component_repair_schedule_row%3Afailure%3ATD-LDM-GRAPH%3Anode-test-topology"
            ]
          }
        }
      ],
      evidenceRefs: [
        "closure-decision://odd-sdlc/t188/component-repair-schedule",
        "pressure://odd-sdlc/component-depth/run/component_repair_schedule_row%3Afailure%3ATD-LDM-GRAPH%3Anode-test-topology"
      ],
      priorManifestId: "file:///tmp/handoff_manifest.json",
      currentGapDossierRef: "closure-gap-dossier://odd-sdlc/t188/current-output",
      retryEligible: true,
      nextLawfulActions: ["repair_worker_output"]
    };
    const plans = componentRepairReentryPlansForGapDossier({
      manifest: {
        workspaceRoot,
        outputFile,
        edgeName: "derive_component_repair_schedule_surface",
        graphFunctionName: "derive_component_repair_schedule_surface",
        targetAssetType: "component_repair_schedule_surface"
      },
      dossier
    });

    assert.equal(plans.length, 1);
    assert.equal(plans[0].targetEdgeName, "prepare_test_execution_surface");
    assert.equal(plans[0].targetAssetType, "test_execution_surface");
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-188 blocked release depth parity becomes closure pressure", () => {
  const pressureRefs = componentDepthResidualPressureRefs({
    runRef: "20260601T000000000Z_pid188",
    admission: admittedComponentDepthRegister(
      "release_depth_parity_surface",
      emptyComponentDepthRegister("release_depth_parity_surface", {
        releaseDepthParity: {
          kind: "sdlc_release_depth_parity_assessment",
          status: "blocked",
          summary: "Release depth parity is blocked by the repair schedule.",
          blockingReasons: ["component_repair_schedule_missing"],
          evidenceRefs: ["evidence://odd-sdlc/t188/release-depth-parity"]
        }
      })
    )
  });

  assert(pressureRefs.length > 0);
  assert(
    pressureRefs.some((ref) =>
      ref.includes("release_depth_parity_blocked%3Acomponent_repair_schedule_missing")
    ),
    pressureRefs.join("\n")
  );

  const decision = closeDecisionWithPressure(pressureRefs);
  assert.notEqual(decision.disposition, "close");
});

test("T-188 design-depth evaluator prompt rejects generic substitute domain rows", () => {
  assert.match(
    evaluatorPromptSource,
    /Domain vocabulary is authority-bound/u
  );
  assert.match(
    evaluatorPromptSource,
    /not from the project slug, package name, file path, examples/u
  );
  assert.match(
    evaluatorPromptSource,
    /Generic substitute nouns are semantic underproduction/u
  );
  assert.match(
    evaluatorPromptSource,
    /must not become a generic mapping-result model/u
  );
  assert.match(
    evaluatorPromptSource,
    /Do not scrape source refs, authority refs, tech-stack\/spec docs/u
  );
  assert.match(
    evaluatorPromptSource,
    /sdlc_verdict_axis\\?".*blocks admission/u
  );
  assert.match(
    evaluatorPromptSource,
    /never \\"sdlc_verdict_axis\\"/u
  );
});

test("T-188 review-grade prompt recognizes admitted materialized file rows", () => {
  assert.match(
    evaluatorPromptSource,
    /Materialized product file rows use relativePath and absolutePath/u
  );
  assert.match(
    evaluatorPromptSource,
    /treat absolutePath as the filesystem path and relativePath as the workspace\/tenant product path/u
  );
  assert.match(
    evaluatorPromptSource,
    /do not mark target_asset, source_asset, module, source_set, inline, aggregate, or requirement findings trace_missing/u
  );
});
