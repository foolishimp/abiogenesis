// Validates: T-171

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitSdlcEdgeEvidence,
  constructSdlcEdgeFulfillmentLedger,
  deriveSdlcEdgeAssuranceCloseDecision,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeObligations,
  deriveSdlcEdgeResidualPressure,
  measureSdlcEdgeGain,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
} from "../../build/semantic/code/src/index.js";

function contractByEdge(edgeRef) {
  const contract = SDLC_EDGE_GAIN_CLOSURE_CONTRACTS.find(
    (candidate) => candidate.edgeRef === edgeRef
  );
  assert(contract, edgeRef);
  return contract;
}

function allLedgerInputsFor(contract) {
  return contract.ledgerInputKinds.map((ledgerInputKind) => ({
    kind: "sdlc_edge_ledger_input_ref",
    ledgerInputKind,
    ledgerRef: `ledger://t171/${contract.edgeRef}/${ledgerInputKind}`
  }));
}

function admittedTargetCarrier(contract) {
  return {
    kind: "sdlc_target_carrier_candidate_admission",
    status: "admitted",
    payloadRef: `payload://t171/${contract.edgeRef}`,
    edgeRef: contract.edgeRef,
    graphVectorRef: `graph-vector://t171/${contract.edgeRef}`,
    targetAssetType: contract.targetAssetType,
    contractRef: `target-carrier-contract://t171/${contract.edgeRef}`,
    contractDigest: "sha256:t171-target-carrier",
    validationRef: `target-carrier-validation://t171/${contract.edgeRef}`
  };
}

function selectedComposition(edgeRef) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t171/${edgeRef}`,
    compositionDigest: `digest://t171/${edgeRef}`,
    compositionSelectionRef: `abg.fn_composition_selection://t171/${edgeRef}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t171/${edgeRef}/evaluate/fp`,
    graphFunctionRef: `graph-function://t171/${edgeRef}`,
    graphVectorRef: `graph-vector://t171/${edgeRef}`,
    basisRef: `basis://t171/${edgeRef}`
  });
}

function gainFor(input) {
  const contract = contractByEdge(input.edgeRef);
  const obligations = deriveSdlcEdgeObligations({
    contract,
    obligationRefs: input.obligationRefs
  });
  const admission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    targetCarrierAdmission: input.targetCarrierAdmission ?? null,
    candidates: input.candidates ?? []
  });
  const gain = measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: admission.admittedEvidence,
    ledgerInputs: input.ledgerInputs ?? allLedgerInputsFor(contract),
    targetCarrierAdmission: input.targetCarrierAdmission ?? null,
    targetCarrierRequired: input.targetCarrierRequired ?? false,
    requiredEvidenceSourceKinds: input.requiredEvidenceSourceKinds ?? []
  });
  const residualPressure = deriveSdlcEdgeResidualPressure(gain);
  const edgeAssuranceCloseDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain,
    residualPressure
  });
  return { contract, obligations, admission, gain, residualPressure, edgeAssuranceCloseDecision };
}

function closureDecisionFor(input) {
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition(input.gain.edgeRef),
    ledgerRef: `ledger://t171/${input.gain.edgeRef}/edge-fulfillment`,
    ledgerVersionRef: `ledger-version://t171/${input.gain.edgeRef}/1`,
    edgeAssuranceContractRef: input.gain.contractRef,
    edgeAssuranceContractDigest: input.gain.contractDigest,
    targetCarrierContractRef: input.gain.targetCarrierContractRef,
    targetCarrierContractDigest: input.gain.targetCarrierContractDigest,
    targetCarrierAdmissionStatus: input.gain.targetCarrierAdmissionStatus,
    targetCarrierAdmissionRef: input.gain.targetCarrierAdmissionRef,
    edgeGainRef: input.gain.gainRef,
    edgeResidualPressureRefs: input.residualPressure.requiredPressureRefs,
    edgeRef: `edge://t171/${input.gain.edgeRef}`,
    attemptRef: `attempt://t171/${input.gain.edgeRef}/1`,
    targetBindingRefs: [`target-binding://t171/${input.gain.edgeRef}`],
    evidenceBundleRefs: [`evidence://t171/${input.gain.edgeRef}`],
    counts: input.counts,
    admitted: true,
    targetCertificationPassed: true,
    fdRecheckPassed: true
  });
  return deriveSdlcEdgeClosureDecision({
    decisionRef: `closure-decision://t171/${input.gain.edgeRef}`,
    ledger,
    edgeClosureFunctionRef: input.gain.closureFunctionRef,
    edgeAssuranceCloseDecision: input.edgeAssuranceCloseDecision,
    currentEdgeLawful: true
  });
}

test("T-171 execution-required closure fails without admitted execution evidence", () => {
  const missingExecution = gainFor({
    edgeRef: "derive_test_execution_result_surface",
    obligationRefs: ["obligation://t171/execution-result"],
    requiredEvidenceSourceKinds: ["execution_result"],
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://t171/worker-assertion",
        sourceKind: "worker_assessment",
        obligationRefs: ["obligation://t171/execution-result"],
        supportsBehavioralFulfillment: true
      }
    ]
  });

  assert.equal(missingExecution.gain.obligationsAndLedgersComplete, true);
  assert.equal(missingExecution.residualPressure.clear, false);
  assert(
    missingExecution.residualPressure.requiredPressureRefs.some((ref) =>
      ref.includes("missing-evidence-source") && ref.includes("execution_result")
    )
  );
  assert.equal(missingExecution.edgeAssuranceCloseDecision.disposition, "retry");

  const decision = closureDecisionFor({
    gain: missingExecution.gain,
    residualPressure: missingExecution.residualPressure,
    edgeAssuranceCloseDecision: missingExecution.edgeAssuranceCloseDecision,
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
  assert.notEqual(decision.disposition, "close");
});

test("T-171 F_P obligation pressure blocks close until fulfilled evidence is admitted", () => {
  const missingFulfillment = gainFor({
    edgeRef: "derive_component_code_surface",
    obligationRefs: ["obligation://t171/component-behavior"],
    candidates: []
  });

  assert.equal(missingFulfillment.gain.missingCount, 1);
  assert.equal(missingFulfillment.gain.obligationsAndLedgersComplete, false);
  assert.equal(missingFulfillment.residualPressure.clear, false);
  assert.equal(missingFulfillment.edgeAssuranceCloseDecision.disposition, "retry");

  const fulfilled = gainFor({
    edgeRef: "derive_component_code_surface",
    obligationRefs: ["obligation://t171/component-behavior"],
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://t171/fp-content",
        sourceKind: "worker_assessment",
        obligationRefs: ["obligation://t171/component-behavior"],
        supportsBehavioralFulfillment: true
      }
    ]
  });

  assert.equal(fulfilled.gain.obligationsAndLedgersComplete, true);
  assert.equal(fulfilled.residualPressure.clear, true);
  assert.equal(fulfilled.edgeAssuranceCloseDecision.disposition, "close");
});

test("T-171 explicit residual pressure survives fulfilled counts", () => {
  const fulfilled = gainFor({
    edgeRef: "derive_component_code_surface",
    obligationRefs: ["obligation://t171/component-behavior"],
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: "evidence://t171/fp-content",
        sourceKind: "worker_assessment",
        obligationRefs: ["obligation://t171/component-behavior"],
        supportsBehavioralFulfillment: true
      }
    ]
  });
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("residual-survives"),
    ledgerRef: "ledger://t171/residual-survives",
    ledgerVersionRef: "ledger-version://t171/residual-survives/1",
    edgeAssuranceContractRef: fulfilled.gain.contractRef,
    edgeAssuranceContractDigest: fulfilled.gain.contractDigest,
    targetCarrierAdmissionStatus: "not_required",
    edgeGainRef: fulfilled.gain.gainRef,
    edgeResidualPressureRefs: ["pressure://t171/manual/execution-not-proven"],
    edgeRef: "edge://t171/derive_component_code_surface",
    attemptRef: "attempt://t171/residual-survives/1",
    targetBindingRefs: ["target-binding://t171/component-code"],
    evidenceBundleRefs: ["evidence://t171/fp-content"],
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

  assert.equal(ledger.fulfillmentConverged, true);
  assert.equal(ledger.edgeConverged, false);

  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t171/residual-survives",
    ledger,
    currentEdgeLawful: true
  });
  assert.notEqual(decision.disposition, "close");
  assert.deepStrictEqual(decision.edgeResidualPressureRefs, [
    "pressure://t171/manual/execution-not-proven"
  ]);
});

test("T-171 target-carrier admission alone cannot close product content", () => {
  const contract = contractByEdge("derive_component_code_surface");
  const targetCarrierOnly = gainFor({
    edgeRef: contract.edgeRef,
    obligationRefs: ["obligation://t171/component-behavior"],
    targetCarrierAdmission: admittedTargetCarrier(contract),
    targetCarrierRequired: true,
    candidates: []
  });

  assert.equal(targetCarrierOnly.gain.targetCarrierAdmissionStatus, "admitted");
  assert.equal(targetCarrierOnly.gain.missingCount, 1);
  assert.equal(targetCarrierOnly.residualPressure.clear, false);
  assert.equal(targetCarrierOnly.edgeAssuranceCloseDecision.disposition, "retry");
  assert(
    targetCarrierOnly.residualPressure.requiredPressureRefs.some((ref) =>
      ref.includes("edge-obligation")
    )
  );
});
