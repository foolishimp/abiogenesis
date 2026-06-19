// Validates: T-200 D5

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructSdlcDecompositionTraceRegister,
  evaluateSdlcDecompositionTraceClosure
} from "../../build/semantic/code/src/index.js";

function child(overrides = {}) {
  return {
    childObligationRef: "obligation://odd-sdlc/t200/child/a",
    parentObligationRef: "obligation://odd-sdlc/t200/parent",
    ownerEdgeRef: "derive_component_test_surface",
    graphFunctionRef: "graph-function:odd_sdlc:derive_component_test_surface",
    graphVectorRef: "derive_component_test_surface",
    closureCriteriaRefs: ["closure://odd-sdlc/t200/child"],
    evidenceRefs: ["evidence://odd-sdlc/t200/child"],
    sourceTestRefs: ["workspace://src/test/scala/CoreSpec.scala"],
    executionShardRefs: ["execution-shard://odd-sdlc/t200/core"],
    consolidationRefs: ["consolidation://odd-sdlc/t200/parent"],
    requirementRefs: ["requirement:REQ-ENG-003"],
    status: "closed",
    ...overrides
  };
}

function register(rows) {
  return constructSdlcDecompositionTraceRegister({
    registerRef: "decomposition-trace://odd-sdlc/t200/closure",
    sourceNodeRef: "node:odd_sdlc:component_code_surface",
    targetNodeRef: "node:odd_sdlc:component_test_surface",
    parentObligationRef: "obligation://odd-sdlc/t200/parent",
    graphCatalogDigestRef: "sha256:t200-graph-catalog",
    edgeContractRefs: ["edge-contract://odd-sdlc/component-test"],
    depthPolicyRef: "depth-policy://odd-sdlc/feature-depth",
    evidencePolicyRef: "evidence-policy://odd-sdlc/requirement-bound-tests",
    rows,
    evidenceRefs: ["strategy://odd-sdlc/t200/depth"],
    requiredLedgerRefs: ["ledger://odd-sdlc/t200/decomposition-trace"],
    consolidationRef: "consolidation://odd-sdlc/t200/parent"
  });
}

test("T-200 D5 closes parent only after all expected child rows are closed", () => {
  const trace = register([
    child({ childObligationRef: "obligation://odd-sdlc/t200/child/a" }),
    child({ childObligationRef: "obligation://odd-sdlc/t200/child/b" })
  ]);
  const closure = evaluateSdlcDecompositionTraceClosure({
    register: trace,
    expectedChildObligationRefs: [
      "obligation://odd-sdlc/t200/child/a",
      "obligation://odd-sdlc/t200/child/b"
    ]
  });

  assert.equal(closure.status, "closed");
  assert.deepEqual(closure.closedChildObligationRefs, [
    "obligation://odd-sdlc/t200/child/a",
    "obligation://odd-sdlc/t200/child/b"
  ]);
  assert.deepEqual(closure.blockingReasonRefs, []);
  assert.equal(closure.consolidationRef, "consolidation://odd-sdlc/t200/parent");
});

test("T-200 D5 blocks parent closure on untraced or open child rows", () => {
  const trace = register([
    child({
      childObligationRef: "obligation://odd-sdlc/t200/child/a",
      status: "open"
    })
  ]);
  const closure = evaluateSdlcDecompositionTraceClosure({
    register: trace,
    expectedChildObligationRefs: [
      "obligation://odd-sdlc/t200/child/a",
      "obligation://odd-sdlc/t200/child/missing"
    ]
  });

  assert.equal(closure.status, "blocked");
  assert.deepEqual(closure.openChildObligationRefs, [
    "obligation://odd-sdlc/t200/child/a"
  ]);
  assert.deepEqual(closure.missingChildObligationRefs, [
    "obligation://odd-sdlc/t200/child/missing"
  ]);
  assert(closure.blockingReasonRefs.includes(
    "decomposition_child_open:obligation://odd-sdlc/t200/child/a"
  ));
  assert(closure.blockingReasonRefs.includes(
    "decomposition_child_missing:obligation://odd-sdlc/t200/child/missing"
  ));
  assert.equal(closure.consolidationRef, null);
});

