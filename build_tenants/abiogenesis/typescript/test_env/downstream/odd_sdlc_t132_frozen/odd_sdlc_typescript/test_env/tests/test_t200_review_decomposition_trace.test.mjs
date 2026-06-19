// Validates: T-200 D4

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructSdlcDecompositionTraceRegisterFromReviewGrade
} from "../../build/semantic/code/src/index.js";

function finding(overrides = {}) {
  return {
    kind: "sdlc_review_grade_obligation_finding",
    obligationId: "requirement:REQ-ENG-003",
    fulfillmentStatus: "partial",
    failureClass: "wrong_stage",
    requiredAction:
      "Carry downstream to component_test_surface and execution evidence before feature closure.",
    evidenceRefs: ["review-evidence://t200/req-eng-003"],
    acceptedAuthorityRefs: ["authority://data-mapper/REQ-ENG-003"],
    fulfillmentBinding: null,
    repairSurfaceTriage: {
      kind: "sdlc_repair_surface_triage",
      disposition: "downstream_deferred",
      repairGraphFunctionRef: null,
      repairGraphVectorRef: null,
      repairAssetRef: null,
      evidenceRefs: ["triage://t200/downstream-deferred"],
      rationale: "Requirement-bound test evidence belongs to a downstream test edge."
    },
    rationale: "Code review found command evidence without requirement-bound test rows.",
    ...overrides
  };
}

function assessment(findings) {
  return {
    kind: "sdlc_review_grade_edge_fulfillment_assessment",
    assessmentVersion: "ts-review-grade-v1",
    graphFunctionName: "derive_component_code_surface",
    edgeName: "derive_component_code_surface",
    targetAssetType: "component_code_surface",
    status: "blocked",
    reviewedObligationIds: findings.map((row) => row.obligationId),
    findings,
    stageBoundaryConformance: null,
    materializationBindingRelation: null,
    obligationCoverageFold: null,
    evidenceRefs: ["review-assessment://t200/code-review"],
    summary: "Downstream test evidence remains open."
  };
}

function traceFromAssessment(reviewAssessment) {
  return constructSdlcDecompositionTraceRegisterFromReviewGrade({
    runRef: "run://odd-sdlc/t200/review",
    assessment: reviewAssessment,
    registerRef: "decomposition-trace://odd-sdlc/t200/from-review",
    sourceNodeRef: "node:odd_sdlc:component_code_surface",
    targetNodeRef: "node:odd_sdlc:component_test_surface",
    parentObligationRef: "obligation://odd-sdlc/t200/parent/feature-depth",
    graphCatalogDigestRef: "sha256:t200-graph-catalog",
    edgeContractRefs: ["edge-contract://odd-sdlc/component-test"],
    depthPolicyRef: "depth-policy://odd-sdlc/feature-depth",
    evidencePolicyRef: "evidence-policy://odd-sdlc/requirement-bound-tests",
    ownerEdgeRef: "derive_component_test_surface",
    graphFunctionRef: "graph-function:odd_sdlc:derive_component_test_surface",
    graphVectorRef: "derive_component_test_surface",
    closureCriteriaRefs: ["closure://odd-sdlc/t200/requirement-bound-test"],
    requiredLedgerRefs: ["ledger://odd-sdlc/t200/decomposition-trace"],
    consolidationRef: "consolidation://odd-sdlc/t200/parent-feature-depth"
  });
}

test("T-200 D4 persists downstream-deferred review findings into decomposition trace rows", () => {
  const register = traceFromAssessment(assessment([finding()]));
  assert.equal(register.rows.length, 1);
  const row = register.rows[0];
  assert.equal(row.parentObligationRef, register.parentObligationRef);
  assert.equal(row.ownerEdgeRef, "derive_component_test_surface");
  assert.equal(row.graphVectorRef, "derive_component_test_surface");
  assert.deepEqual(row.requirementRefs, ["requirement:REQ-ENG-003"]);
  assert.equal(row.status, "open");
  assert(
    row.sourceReviewFindingRefs[0].startsWith(
      "pressure://odd-sdlc/review-grade/run://odd-sdlc/t200/review/"
    )
  );
  assert(row.evidenceRefs.includes("review-evidence://t200/req-eng-003"));
  assert(row.evidenceRefs.includes("triage://t200/downstream-deferred"));
  assert(row.evidenceRefs.includes("review-assessment://t200/code-review"));
});

test("T-200 D4 refuses review prose that was not triaged as downstream_deferred", () => {
  assert.throws(
    () =>
      traceFromAssessment(
        assessment([
          finding({
            repairSurfaceTriage: {
              kind: "sdlc_repair_surface_triage",
              disposition: "current_edge_repair",
              repairGraphFunctionRef: null,
              repairGraphVectorRef: null,
              repairAssetRef: null,
              evidenceRefs: ["triage://t200/current-edge"],
              rationale: "Current edge repair."
            }
          })
        ])
      ),
    /downstream_deferred finding/
  );
});

