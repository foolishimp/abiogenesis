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

function summary(rows, overrides = {}) {
  return deriveSdlcDecompositionSummary({
    stageId: "requirements_to_components",
    upstreamKind: "requirement",
    downstreamKind: "component",
    thresholds: SDLC_DEFAULT_DECOMPOSITION_SUMMARY_THRESHOLDS,
    rows,
    ...overrides
  });
}

test("T-173 selects zoom when one upstream explodes into many downstream rows", () => {
  const exploded = summary(
    Array.from({ length: 9 }, (_, index) =>
      row({
        downstreamId: `component://swarm-${index + 1}`,
        ownedUpstreamRefs: ["REQ-EXPLODE-001"],
        publicBoundaryRefs: [`src/swarm-${index + 1}.ts`],
        substantiveResponsibilityRefs: [`function://swarm-${index + 1}`],
        materializationTargetRefs: [`src/swarm-${index + 1}.ts`]
      })
    )
  );
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/zoom/explosion",
    outcomeClass: "domain_product",
    decompositionSummary: exploded,
    evidenceRefs: ["decomposition-summary://exploded"]
  });

  assert.equal(selection.hopClass, "zoom_required");
  assert.equal(selection.zoomAdmission.disposition, "zoom_required");
  assert.ok(
    selection.zoomAdmission.reasonRefs.includes(
      "decomposition_explosion_downstream_rows"
    )
  );
});

test("T-173 blocks ambiguous pressure ownership instead of zooming", () => {
  const invalid = summary([
    row({
      downstreamId: "component://placeholder",
      ownedUpstreamRefs: [],
      publicBoundaryRefs: ["src/placeholder.ts"],
      substantiveResponsibilityRefs: ["function://placeholder"],
      materializationTargetRefs: ["src/placeholder.ts"]
    })
  ]);
  const selection = deriveSdlcTraversalHopSelection({
    selectionRef: "selection://t173/block/unowned",
    outcomeClass: "framework_smoke",
    decompositionSummary: invalid,
    typedTemplateAvailable: true,
    evidenceRefs: ["decomposition-summary://invalid"]
  });

  assert.equal(selection.hopClass, "blocked");
  assert.equal(selection.zoomAdmission.disposition, "blocked");
  assert.ok(
    selection.blockingReasons.includes(
      "decomposition_downstream_rows_without_upstream_basis"
    )
  );
});
