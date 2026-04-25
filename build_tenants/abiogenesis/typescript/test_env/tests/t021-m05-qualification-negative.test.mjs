// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructFakeLaneQualificationRequest,
  constructMethodTraceQualificationRequest,
  constructQualificationDesignAssetRef,
  constructQualificationProofLaneRef,
  constructQualificationSourceAssetRef,
  qualifyFakeLaneScenario,
  qualifyMethodTrace
} from "../../build/semantic/code/src/qualification/m05/index.js";
import { buildMethodTraceRequest } from "./support/m05-fixtures.mjs";

test("M05 qualification negative: missing declared structural authority fails method trace", async () => {
  const baseRequest = await buildMethodTraceRequest();
  const request = constructMethodTraceQualificationRequest({
    designAssets: baseRequest.designAssets.map((asset) =>
      asset.kind === "structural_carrier_diagram"
        ? constructQualificationDesignAssetRef({
            path: asset.path,
            kind: asset.kind,
            exists: asset.exists,
            declared: false
          })
        : asset
    ),
    proofLanes: baseRequest.proofLanes,
    sourceAssets: baseRequest.sourceAssets
  });

  const outcome = qualifyMethodTrace(request);
  assert.equal(outcome.kind, "rejected");
  assert.match(outcome.reason, /missing declared authority/i);
  assert.deepStrictEqual(outcome.gaps, [
    {
      kind: "undeclared_design_asset",
      ref: request.designAssets.find(
        (asset) => asset.kind === "structural_carrier_diagram"
      ).path
    }
  ]);
});

test("M05 qualification negative: fake lane rejects unresolved asset routing and non-ready projection", () => {
  const request = constructFakeLaneQualificationRequest({
    scenarioName: "broken-fake-lane",
    scenarioAuthorityRefs: [],
    assetAddressingKind: "rejected",
    resolvedTargetKind: null,
    resolvedTargetHandle: null,
    dispatchExpectedEdge: null,
    startOutcomeKind: "rejected",
    startStopPredicate: null,
    emittedEventKinds: [],
    resultAssessmentKind: "rejected",
    liveStatusKind: "attention",
    liveRunStatus: "runtime_unavailable"
  });

  const outcome = qualifyFakeLaneScenario(request);
  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    scenarioName: "broken-fake-lane",
    reason: "scenario authority refs missing",
    trace: [
      {
        kind: "scenario_authority",
        valid: false,
        detail: "scenario authority refs missing"
      },
      {
        kind: "asset_addressing",
        valid: false,
        detail: "asset-addressing did not resolve one graph-function target"
      },
      {
        kind: "public_start",
        valid: false,
        detail: "public start did not preserve dispatch_required blocking truth"
      },
      {
        kind: "dispatch_request",
        valid: false,
        detail: "dispatch request expectation truth missing"
      },
      {
        kind: "result_assessment",
        valid: false,
        detail: "result assessment did not preserve accepted assessed truth"
      },
      {
        kind: "live_status",
        valid: false,
        detail: "live status did not project assessed ready truth"
      }
    ]
  });
});
