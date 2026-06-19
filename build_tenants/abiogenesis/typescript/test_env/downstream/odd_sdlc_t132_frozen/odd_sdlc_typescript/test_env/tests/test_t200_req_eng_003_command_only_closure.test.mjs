// Validates: T-200 D6

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructSdlcDecompositionTraceRegister,
  evaluateSdlcDecompositionTraceClosure
} from "../../build/semantic/code/src/index.js";

function child(overrides = {}) {
  return {
    childObligationRef: "obligation://odd-sdlc/t200/child/req-eng-003",
    parentObligationRef: "obligation://odd-sdlc/t200/parent/data-mapper-depth",
    ownerEdgeRef: "derive_component_test_surface",
    graphFunctionRef: "graph-function:odd_sdlc:derive_component_test_surface",
    graphVectorRef: "derive_component_test_surface",
    closureCriteriaRefs: ["closure://odd-sdlc/t200/requirement-bound-test"],
    evidenceRefs: ["command://sbt/test"],
    sourceTestRefs: [],
    executionShardRefs: [],
    consolidationRefs: ["consolidation://odd-sdlc/t200/data-mapper-depth"],
    requirementRefs: ["requirement:REQ-ENG-003"],
    status: "closed",
    ...overrides
  };
}

function register(row) {
  return constructSdlcDecompositionTraceRegister({
    registerRef: "decomposition-trace://odd-sdlc/t200/req-eng-003",
    sourceNodeRef: "node:odd_sdlc:component_code_surface",
    targetNodeRef: "node:odd_sdlc:component_test_surface",
    parentObligationRef: "obligation://odd-sdlc/t200/parent/data-mapper-depth",
    graphCatalogDigestRef: "sha256:t200-graph-catalog",
    edgeContractRefs: ["edge-contract://odd-sdlc/component-test"],
    depthPolicyRef: "depth-policy://odd-sdlc/feature-depth",
    evidencePolicyRef: "evidence-policy://odd-sdlc/requirement-bound-tests",
    rows: [row],
    evidenceRefs: ["strategy://odd-sdlc/t200/depth"],
    requiredLedgerRefs: ["ledger://odd-sdlc/t200/decomposition-trace"],
    consolidationRef: "consolidation://odd-sdlc/t200/data-mapper-depth"
  });
}

test("T-200 D6 rejects REQ-ENG-003 closure from command-only sbt evidence", () => {
  const closure = evaluateSdlcDecompositionTraceClosure({
    register: register(child())
  });

  assert.equal(closure.status, "blocked");
  assert.deepEqual(closure.missingSourceTestChildObligationRefs, [
    "obligation://odd-sdlc/t200/child/req-eng-003"
  ]);
  assert.deepEqual(closure.missingExecutionShardChildObligationRefs, [
    "obligation://odd-sdlc/t200/child/req-eng-003"
  ]);
  assert.deepEqual(closure.commandOnlyEvidenceChildObligationRefs, [
    "obligation://odd-sdlc/t200/child/req-eng-003"
  ]);
  assert(closure.blockingReasonRefs.includes(
    "decomposition_child_command_only_evidence:obligation://odd-sdlc/t200/child/req-eng-003"
  ));
  assert.equal(closure.consolidationRef, null);
});

test("T-200 D6 allows requirement-bound closure with source test, shard, and admitted evidence refs", () => {
  const closure = evaluateSdlcDecompositionTraceClosure({
    register: register(
      child({
        evidenceRefs: [
          "command://sbt/test",
          "admitted-evidence://odd-sdlc/t200/req-eng-003/test-result"
        ],
        sourceTestRefs: ["workspace://cdme-core/src/test/scala/CoreSpec.scala"],
        executionShardRefs: ["execution-shard://data-mapper/sbt-test/core"]
      })
    )
  });

  assert.equal(closure.status, "closed");
  assert.deepEqual(closure.blockingReasonRefs, []);
  assert.equal(
    closure.consolidationRef,
    "consolidation://odd-sdlc/t200/data-mapper-depth"
  );
});

