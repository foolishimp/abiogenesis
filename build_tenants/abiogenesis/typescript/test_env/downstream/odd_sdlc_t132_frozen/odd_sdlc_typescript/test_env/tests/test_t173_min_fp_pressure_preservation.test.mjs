// Validates: T-173

import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveSdlcDecompositionSummary,
  deriveSdlcTraversalHopSelection,
  SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS
} from "../../build/semantic/code/src/index.js";

function row(overrides = {}) {
  return {
    downstreamId: "component://core",
    parentId: "module://app",
    ownedUpstreamRefs: ["REQ-001"],
    publicBoundaryRefs: ["src/index.ts"],
    substantiveResponsibilityRefs: ["function://main"],
    materializationTargetRefs: ["src/index.ts"],
    residualRefs: [],
    ...overrides
  };
}

function summary(rows) {
  return deriveSdlcDecompositionSummary({
    stageId: "requirements_to_components",
    upstreamKind: "requirement",
    downstreamKind: "component",
    thresholds: SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS,
    rows
  });
}

test("T-173 typed-template Min(F_P) preserves pressure through summary and template refs", () => {
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/min-fp/template",
    outcomeClass: "framework_smoke",
    decompositionSummary: summary([
      row({
        downstreamId: "component://hello-world",
        ownedUpstreamRefs: ["REQ-HELLO-001"],
        publicBoundaryRefs: ["src/hello.js"],
        substantiveResponsibilityRefs: ["function://hello"],
        materializationTargetRefs: ["src/hello.js"]
      })
    ]),
    typedTemplateAvailable: true,
    evidenceRefs: ["template://hello-world/javascript"]
  });

  assert.equal(selection.hopClass, "single_hop");
  assert.equal(selection.pressurePreservation.admissionDecision, "admit");
  assert.equal(selection.pressurePreservation.mechanism, "typed_template");
  assert.ok(
    selection.pressurePreservation.preservedPressureRefs.includes(
      "template://hello-world/javascript"
    )
  );
  assert.ok(
    selection.pressurePreservation.preservedPressureRefs.some((ref) =>
      ref.startsWith("decomposition-summary://")
    )
  );
});

test("T-173 projection-only Min(F_P) rejects missing pressure evidence", () => {
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/min-fp/projection-missing",
    outcomeClass: "framework_smoke",
    decompositionSummary: null,
    projectionOnlyEligible: true,
    skippedEdgeRefs: ["edge://derive_code_surface"]
  });

  assert.equal(selection.hopClass, "blocked");
  assert.equal(selection.pressurePreservation.admissionDecision, "reject");
  assert.ok(
    selection.blockingReasons.includes(
      "complexity_decomposition_summary_missing"
    )
  );
});

test("T-173 projection-only Min(F_P) admits replay-visible evidence", () => {
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/min-fp/projection-present",
    outcomeClass: "framework_smoke",
    decompositionSummary: null,
    projectionOnlyEligible: true,
    skippedEdgeRefs: ["edge://derive_code_surface"],
    evidenceRefs: ["carrier://component-code/admitted"]
  });

  assert.equal(selection.hopClass, "single_hop");
  assert.equal(selection.pressurePreservation.admissionDecision, "admit");
  assert.equal(
    selection.pressurePreservation.mechanism,
    "replay_visible_projection"
  );
  assert.deepEqual(selection.pressurePreservation.skippedEdgeRefs, [
    "edge://derive_code_surface"
  ]);
});
