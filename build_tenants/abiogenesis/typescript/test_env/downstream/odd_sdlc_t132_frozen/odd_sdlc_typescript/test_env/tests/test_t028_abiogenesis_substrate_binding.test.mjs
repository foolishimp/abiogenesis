// Validates: REQ-F-ODDSDLC-040
// Validates: REQ-F-ODDSDLC-042
// Validates: REQ-F-ODDSDLC-043
// Investigates: T-028

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructVectorClosedEvent,
  constructVectorTraversalPlannedEvent
} from "@abiogenesis/typescript-tenant";

import {
  ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT,
  constructOddSdlcAbiogenesisExecutionBasis,
  deriveOddSdlcAbiogenesisSubstrateReport
} from "../../build/semantic/code/src/index.js";

test("T-028 declares ABIogenesis as consumed substrate authority", () => {
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.packageName,
    "@abiogenesis/typescript-tenant"
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.packageVersion,
    "4.1.0-rc.2"
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.runtimeTruthAuthority,
    "abiogenesis"
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.temporalTruthAuthority,
    "abiogenesis"
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.eventCalculusTruthAuthority,
    "abiogenesis_replay_projection"
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.constructionEvaluatorTruthAuthority,
    "abiogenesis_construction_priority_projection"
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.livenessObserverTruthAuthority,
    "abiogenesis_runtime_liveness_observer_projection"
  );
  assert.deepStrictEqual(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.localRuntimeEventFamilies,
    []
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.localTemporalAuthority,
    false
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.choosesNextVectorLocally,
    false
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.localConstructionRankingAuthority,
    false
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.localLivenessAuthority,
    false
  );
  assert.deepStrictEqual(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.temporalConstraintVectorAttrKeys,
    ["abg.temporal_constraint"]
  );
  assert.deepStrictEqual(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.temporalConstraintConfigKeys,
    [
      "constraint_ref",
      "operator",
      "not_before_ref",
      "deadline_ref",
      "schedule_policy_ref",
      "timer_provider_ref",
      "deadline_breach_action"
    ]
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-060")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-065")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-066")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-107")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-119")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-120")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-127")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-129")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-148")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-149") &&
      entry.includes("primitive iteration-outcome projection")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-151")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-152") &&
      entry.includes("static GTL program conformance gate")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-156") &&
      entry.includes("static GTL annotation validation")
    )
  );
  assert(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.sourceAssumptions.some((entry) =>
      entry.includes("T-158") &&
      entry.includes("plugin result-interface validation") &&
      entry.includes("compiler-admitted result-interface catalog") &&
      entry.includes("runner/replay-visible result-envelope ingress")
    )
  );
});

test("T-028 adapter admits one ABI ExecutionBasis over a published graph function", () => {
  const basis = constructOddSdlcAbiogenesisExecutionBasis();
  const report = deriveOddSdlcAbiogenesisSubstrateReport({
    basis,
    events: []
  });

  assert.equal(basis.moduleName, "odd_sdlc_typescript_substrate_probe");
  assert.equal(basis.graphFunction.name, "ODD_SDLC_SUBSTRATE_PROBE");
  assert.equal(basis.graph.vectors.length, 1);
  assert.equal(basis.job.contracts[0].targetId, basis.graphFunction.id);
  assert.equal(report.projection.nextVectorIndex, 0);
  assert.equal(report.iterationDecision.kind, "advance_vector");
  assert.equal(report.transition.kind, "fd_advance");
  assert.equal(report.probe.kind, "traversal_structure_probe");
  assert.equal(report.probe.graphFunctionName, "ODD_SDLC_SUBSTRATE_PROBE");
  assert.equal(report.probe.edge, "SdlcWorksite->SdlcWorkReport");
  assert.deepStrictEqual(report.iterationEventKinds, [
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned"
  ]);
  assert.deepStrictEqual(report.transitionEventKinds, [
    "basis_admitted",
    "fd_advance_ready"
  ]);
});

test("T-028 closed replay proves next-vector truth comes from ABI projection", () => {
  const basis = constructOddSdlcAbiogenesisExecutionBasis();
  const events = [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex: 0 }),
    constructVectorClosedEvent({
      basis,
      vectorIndex: 0,
      closureKind: "advanced"
    })
  ];
  const report = deriveOddSdlcAbiogenesisSubstrateReport({
    basis,
    events
  });

  assert.equal(report.projection.nextVectorIndex, null);
  assert.equal(report.iterationDecision.kind, "converged");
  assert.equal(report.transition.kind, "terminal");
  assert.equal(report.probe.projection.nextVectorIndex, null);
  assert.deepStrictEqual(report.transitionEventKinds, [
    "basis_admitted",
    "terminal_reached"
  ]);
});
