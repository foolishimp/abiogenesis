// Validates: T-200 D2

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitSdlcDecompositionTraceRegister,
  constructSdlcDecompositionTraceRegister,
  constructSdlcDepthTraversalOutcome
} from "../../build/semantic/code/src/index.js";

function child(overrides = {}) {
  return {
    childObligationRef: "obligation://odd-sdlc/t200/child/source-test",
    parentObligationRef: "obligation://odd-sdlc/t200/parent/feature-depth",
    ownerEdgeRef: "edge://odd-sdlc/derive_component_test_surface",
    graphFunctionRef: "graph-function:odd_sdlc:derive_component_test_surface",
    graphVectorRef: "derive_component_test_surface",
    closureCriteriaRefs: ["closure://odd-sdlc/t200/source-test-bound"],
    evidenceRefs: ["review-finding://odd-sdlc/t200/downstream-deferred"],
    consolidationRefs: ["consolidation://odd-sdlc/t200/parent-feature-depth"],
    requirementRefs: ["REQ-ENG-003"],
    ...overrides
  };
}

function register(overrides = {}) {
  return constructSdlcDecompositionTraceRegister({
    registerRef: "decomposition-trace://odd-sdlc/t200/register",
    sourceNodeRef: "node:odd_sdlc:component_code_surface",
    targetNodeRef: "node:odd_sdlc:component_test_surface",
    parentObligationRef: "obligation://odd-sdlc/t200/parent/feature-depth",
    graphCatalogDigestRef: "sha256:t200-graph-catalog",
    edgeContractRefs: ["edge-contract://odd-sdlc/component-test"],
    depthPolicyRef: "depth-policy://odd-sdlc/feature-depth",
    evidencePolicyRef: "evidence-policy://odd-sdlc/requirement-bound-tests",
    rows: [child()],
    evidenceRefs: ["strategy://odd-sdlc/t200/depth"],
    requiredLedgerRefs: ["ledger://odd-sdlc/t200/decomposition-trace"],
    consolidationRef: "consolidation://odd-sdlc/t200/parent-feature-depth",
    ...overrides
  });
}

test("T-200 D2 admits decomposition trace register and projects depth traversal outcome refs", () => {
  const admittedRegister = register();
  const outcome = constructSdlcDepthTraversalOutcome({
    status: "admitted",
    depthPlanRef: "depth-plan://odd-sdlc/t200/plan",
    sourceNodeRef: admittedRegister.sourceNodeRef,
    targetNodeRef: admittedRegister.targetNodeRef,
    parentObligationRef: admittedRegister.parentObligationRef,
    graphCatalogDigestRef: admittedRegister.graphCatalogDigestRef,
    edgeContractRefs: admittedRegister.edgeContractRefs,
    depthPolicyRef: admittedRegister.depthPolicyRef,
    evidencePolicyRef: admittedRegister.evidencePolicyRef,
    decompositionTraceRegister: admittedRegister
  });

  assert.equal(outcome.status, "admitted");
  assert.equal(outcome.decompositionTraceRegisterRef, admittedRegister.registerRef);
  assert.deepEqual(outcome.childObligationRefs, [
    "obligation://odd-sdlc/t200/child/source-test"
  ]);
  assert.deepEqual(outcome.graphVectorRefs, ["derive_component_test_surface"]);
  assert.equal(
    outcome.consolidationRef,
    "consolidation://odd-sdlc/t200/parent-feature-depth"
  );
  assert.deepEqual(outcome.requiredLedgerRefs, [
    "ledger://odd-sdlc/t200/decomposition-trace"
  ]);
});

test("T-200 D2 rejects missing parent, child, evidence, and consolidation refs", () => {
  assert.throws(
    () => register({ parentObligationRef: "" }),
    /parentObligationRef: expected non-empty string/
  );
  assert.throws(
    () => register({ rows: [child({ childObligationRef: "" })] }),
    /childObligationRef: expected non-empty string/
  );
  assert.throws(
    () => register({ rows: [child({ evidenceRefs: [] })] }),
    /evidenceRefs: expected at least one ref/
  );
  assert.throws(
    () => register({ rows: [child({ consolidationRefs: [] })] }),
    /consolidationRefs: expected at least one ref/
  );
});

test("T-200 D2 fails closed on mismatched parent rows and rejected outcome without reason", () => {
  assert.throws(
    () =>
      register({
        rows: [
          child({
            parentObligationRef: "obligation://odd-sdlc/t200/other-parent"
          })
        ]
      }),
    /rows\[0\]\.parentObligationRef/
  );
  assert.throws(
    () =>
      constructSdlcDepthTraversalOutcome({
        status: "rejected",
        depthPlanRef: "depth-plan://odd-sdlc/t200/rejected",
        sourceNodeRef: "node:odd_sdlc:component_code_surface",
        targetNodeRef: "node:odd_sdlc:component_test_surface",
        parentObligationRef: "obligation://odd-sdlc/t200/parent/feature-depth",
        graphCatalogDigestRef: "sha256:t200-graph-catalog",
        edgeContractRefs: ["edge-contract://odd-sdlc/component-test"],
        depthPolicyRef: "depth-policy://odd-sdlc/feature-depth",
        evidencePolicyRef: "evidence-policy://odd-sdlc/requirement-bound-tests"
      }),
    /nonAdmissionReasonRefs/
  );
  assert.throws(
    () =>
      admitSdlcDecompositionTraceRegister({
        ...register(),
        runtimeEvents: []
      }),
    /runtimeEvents: unexpected field/
  );
});

