// Validates: REQ-F-ODDSDLC-069
// Validates: REQ-F-ODDSDLC-070
// Validates: REQ-F-ODDSDLC-071
// Validates: REQ-F-ODDSDLC-072
// Validates: REQ-F-ODDSDLC-073
// Investigates: T-169
// Investigates: T-170

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
  materializeGraphFunction
} from "@abiogenesis/typescript-tenant";

import {
  admitSdlcEdgeEvidence,
  admitSdlcTargetCarrierCandidate,
  assertTraversalIntentPackagePressure,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcGtlModule,
  constructSdlcTargetCarrierRows,
  deriveSdlcEdgeAssuranceCloseDecision,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcEdgeObligations,
  deriveSdlcEdgeResidualPressure,
  deriveWorkerHandoffManifest,
  digestSdlcEdgeGainClosureContract,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  measureSdlcEdgeGain,
  missingSdlcTargetCarrierAdmission,
  projectSdlcEdgeAssuranceReadModel,
  projectSdlcTargetCarrierReadModel,
  resolveSdlcEdgeGainClosureContract,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
  sdlcEdgeAssuranceContractRef,
  sdlcTargetCarrierCandidate,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t169-"));
  mkdirSync(path.join(root, "specification"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(path.join(root, "README.md"), "# T-169 Fixture\n", "utf8");
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nINT-T169: Prove target carrier contract projection.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    "# Requirements\n\nREQ-T169-001: The worker output carrier is admitted.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t169_fixture",
      "active_tenant: typescript",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    language: typescript",
      "    build_tool: npm"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function selectedComposition(caseId) {
  return Object.freeze({
    kind: "sdlc_selected_abg_fn_composition_identity",
    compositionRef: `abg.fn_composition://t169/${caseId}`,
    compositionDigest: `digest://t169/${caseId}`,
    compositionSelectionRef: `abg.fn_composition_selection://t169/${caseId}`,
    selectedRegimeBindingRef:
      `abg.fn_composition.regime_binding://t169/${caseId}/evaluate/fp`,
    graphFunctionRef: `graph-function://t169/${caseId}`,
    graphVectorRef: `graph-vector://t169/${caseId}`,
    basisRef: `basis://t169/${caseId}`
  });
}

function materializedVectorsForModule(module) {
  return module.graphFunctions.flatMap((graphFunction) =>
    materializeGraphFunction(graphFunction).vectors
  );
}

function targetCarrierRow(edgeRef) {
  const module = constructSdlcGtlModule();
  const rows = constructSdlcTargetCarrierRows({
    vectors: materializedVectorsForModule(module),
    contracts: [resolveSdlcEdgeGainClosureContract(edgeRef)]
  });
  const row = rows.find((candidate) => candidate.edgeRef === edgeRef);
  assert(row, edgeRef);
  return row;
}

function allLedgerInputsFor(contract) {
  return contract.ledgerInputKinds.map((ledgerInputKind) => ({
    kind: "sdlc_edge_ledger_input_ref",
    ledgerInputKind,
    ledgerRef: `ledger://t169/${contract.edgeRef}/${ledgerInputKind}`
  }));
}

function closeReadyGain(edgeRef, targetCarrierAdmission) {
  const contract = resolveSdlcEdgeGainClosureContract(edgeRef);
  const obligationRef = `obligation://t169/${edgeRef}/primary`;
  const obligations = deriveSdlcEdgeObligations({
    contract,
    obligationRefs: [obligationRef]
  });
  const edgeEvidenceAdmission = admitSdlcEdgeEvidence({
    contract,
    obligations,
    candidates: [
      {
        kind: "sdlc_edge_evidence_candidate",
        evidenceRef: `evidence://t169/${edgeRef}/behavior`,
        sourceKind: "worker_assessment",
        obligationRefs: [obligationRef],
        supportsBehavioralFulfillment: true
      }
    ],
    targetCarrierAdmission
  });
  return measureSdlcEdgeGain({
    contract,
    obligations,
    admittedEvidence: edgeEvidenceAdmission.admittedEvidence,
    ledgerInputs: allLedgerInputsFor(contract),
    targetCarrierAdmission,
    targetCarrierRequired: true
  });
}

test("T-169 SDLC graph vectors declare target carrier contracts in the graph surface", () => {
  const module = constructSdlcGtlModule();
  const vectors = materializedVectorsForModule(module);
  const targetCarriers = projectSdlcTargetCarrierReadModel({
    publishedGraphVectorRefs: vectors.map((vector) => vector.name),
    vectors,
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  });
  const edgeAssurance = projectSdlcEdgeAssuranceReadModel({
    module,
    targetCarriers
  });
  assert.equal(targetCarriers.diagnostics.length, 0);
  assert.equal(edgeAssurance.diagnostics.length, 0);

  const row = targetCarrierRow("derive_code_surface");
  const vector = materializedVectorsForModule(module).find(
    (candidate) => candidate.name === "derive_code_surface"
  );
  assert(vector);
  assert(
    vector.declarations.entries.some(
      (entry) => entry.key === TARGET_CARRIER_CONTRACT_DECLARATION_KEY
    )
  );
  assert.equal(row.graphVectorRef, vector.name);
  assert.equal(row.targetNodeRef, vector.target.id);
  assert.equal(row.targetSchemaRef, vector.target.schema.ref);
  assert.equal(row.targetCarrierContractRef, row.binding.contractRef);
  assert.equal(row.targetCarrierContractDigest, row.binding.configDigest);
});

test("T-169 handoff manifests project the selected target carrier contract", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 12,
    contract,
    runId: "t169-target-carrier"
  });
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );

  const row = targetCarrierRow(contract.edgeName);
  assert.equal(manifest.targetCarrierContractRef, row.targetCarrierContractRef);
  assert.equal(
    manifest.targetCarrierContractDigest,
    row.targetCarrierContractDigest
  );
  assert.equal(
    manifest.traversalIntentPackage.targetCarrierProjection.outputCarrierKind,
    row.outputCarrierKind
  );
  assert.deepEqual(
    manifest.traversalIntentPackage.targetCarrierProjection.requiredFieldRefs,
    row.requiredFieldRefs
  );
  assert.equal(
    invocationPackage.targetCarrierProjection.kind,
    "sdlc_worker_target_carrier_prompt_projection"
  );
  assert.equal(
    "constructionTemplate" in invocationPackage.targetCarrierProjection,
    false
  );
  assert.equal(
    invocationPackage.targetCarrierProjection.targetCarrierContractRef,
    manifest.targetCarrierProjection.targetCarrierContractRef
  );
  assertTraversalIntentPackagePressure(manifest);

  const testDesignContract = hookContractByEdgeName("derive_test_design_surface");
  const testDesignManifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "derive_test_design_surface",
    edgeName: testDesignContract.edgeName,
    vectorIndex: 0,
    contract: testDesignContract,
    runId: "t169-test-design-target-carrier"
  });
  const template =
    testDesignManifest.targetCarrierProjection.constructionTemplate;
  assert.equal(template.targetAssetType, "test_design_surface");
  assert.equal(
    template.payloadTemplate?.fieldTypes.uatTestcaseRows,
    "sdlc_test_case_row[]"
  );
  assert(
    template.rowTemplates.some(
      (rowTemplate) =>
        rowTemplate.templateRef.endsWith("/row/test-component-topology") &&
        rowTemplate.requiredFields.includes("relativePath")
    )
  );
  assert(
    template.rowTemplates.some(
      (rowTemplate) =>
        rowTemplate.templateRef.endsWith("/row/test-data-binding") &&
        rowTemplate.requiredFields.includes("inputFixtureRefs")
    )
  );
  assert(
    template.rowTemplates.some(
      (rowTemplate) =>
        rowTemplate.templateRef.endsWith("/row/expected-result") &&
        rowTemplate.requiredFields.includes("verificationPolicyRef")
    )
  );
});

test("T-169 malformed graph target-carrier declarations project typed diagnostics", () => {
  const module = constructSdlcGtlModule();
  const vectors = materializedVectorsForModule(module);
  const deriveCode = vectors.find(
    (candidate) => candidate.name === "derive_code_surface"
  );
  assert(deriveCode);
  const malformedVectors = vectors.map((vector) =>
    vector.name === deriveCode.name
      ? {
          ...vector,
          declarations: {
            ...vector.declarations,
            entries: []
          }
        }
      : vector
  );

  const targetCarriers = projectSdlcTargetCarrierReadModel({
    publishedGraphVectorRefs: malformedVectors.map((vector) => vector.name),
    vectors: malformedVectors,
    contracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
  });

  assert(
    targetCarriers.diagnostics.some(
      (diagnostic) =>
        diagnostic.edgeRef === "derive_code_surface" &&
        diagnostic.code === "target_carrier_declaration_invalid"
    )
  );
  assert(targetCarriers.missingContractRefs.includes("derive_code_surface"));
});

test("T-169 carrier admission accepts and rejects candidates from one contract row", () => {
  const row = targetCarrierRow("derive_code_surface");
  const admitted = admitSdlcTargetCarrierCandidate({
    row,
    payloadRef: "payload://t169/derive-code/good",
    candidate: sdlcTargetCarrierCandidate({
      row,
      payload: {
        outputFile: "workspace://build_tenants/typescript/code/src/index.ts",
        materializedFiles: []
      },
      summary: "code surface produced",
      evidenceRefs: ["evidence://t169/code"]
    })
  });
  assert.equal(admitted.status, "admitted");
  assert.equal(admitted.contractRef, row.targetCarrierContractRef);
  assert.equal(admitted.contractDigest, row.targetCarrierContractDigest);

  const base = {
    kind: row.outputCarrierKind,
    targetAssetType: row.targetAssetType,
    edgeRef: row.edgeRef,
    contractRef: row.targetCarrierContractRef,
    contractDigest: row.targetCarrierContractDigest,
    payload: { outputFile: "workspace://out" }
  };
  assert.equal(
    admitSdlcTargetCarrierCandidate({
      row,
      payloadRef: "payload://t169/missing-payload",
      candidate: { ...base, payload: undefined }
    }).status,
    "rejected"
  );
  assert.equal(
    admitSdlcTargetCarrierCandidate({
      row,
      payloadRef: "payload://t169/wrong-kind",
      candidate: { ...base, kind: "wrong_kind" }
    }).rejectionClass,
    "wrong_literal_domain"
  );
  assert.equal(
    admitSdlcTargetCarrierCandidate({
      row,
      payloadRef: "payload://t169/fixed-mutation",
      candidate: { ...base, contractDigest: "sha256:wrong" }
    }).rejectionClass,
    "fixed_protocol_field_mutation"
  );
});

test("T-170 rejected or missing target carrier admission preserves protocol pressure without content verdict", () => {
  const edgeRef = "derive_code_surface";
  const row = targetCarrierRow(edgeRef);
  const rejected = admitSdlcTargetCarrierCandidate({
    row,
    payloadRef: "payload://t169/rejected",
    candidate: {
      kind: row.outputCarrierKind,
      targetAssetType: row.targetAssetType,
      edgeRef: row.edgeRef,
      contractRef: row.targetCarrierContractRef,
      contractDigest: "sha256:wrong",
      payload: { outputFile: "workspace://out" }
    }
  });
  assert.equal(rejected.status, "rejected");

  const gain = closeReadyGain(edgeRef, rejected);
  assert.equal(gain.obligationsAndLedgersComplete, true);
  assert(
    gain.residualPressureRefs.some((ref) =>
      ref.includes("/target-carrier/")
    )
  );
  const residualPressure = deriveSdlcEdgeResidualPressure(gain);
  const assuranceDecision = deriveSdlcEdgeAssuranceCloseDecision({
    gain,
    residualPressure
  });
  assert.equal(assuranceDecision.disposition, "block");
  assert.equal(assuranceDecision.targetCarrierContractRef, row.targetCarrierContractRef);
  assert(
    assuranceDecision.reasonRefs.some((ref) =>
      ref.includes("/target-carrier/")
    )
  );

  const contract = resolveSdlcEdgeGainClosureContract(edgeRef);
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("derive-code"),
    ledgerRef: "ledger://t169/derive-code/edge-fulfillment",
    ledgerVersionRef: "ledger-version://t169/derive-code/edge-fulfillment/1",
    edgeAssuranceContractRef: sdlcEdgeAssuranceContractRef(contract),
    edgeAssuranceContractDigest: digestSdlcEdgeGainClosureContract(contract),
    targetCarrierContractRef: gain.targetCarrierContractRef,
    targetCarrierContractDigest: gain.targetCarrierContractDigest,
    targetCarrierAdmissionStatus: gain.targetCarrierAdmissionStatus,
    targetCarrierAdmissionRef: gain.targetCarrierAdmissionRef,
    edgeGainRef: gain.gainRef,
    edgeResidualPressureRefs: residualPressure.requiredPressureRefs,
    edgeRef: "edge://t169/derive-code",
    attemptRef: "attempt://t169/derive-code/1",
    targetBindingRefs: ["target-binding://t169/derive-code"],
    evidenceBundleRefs: ["evidence://t169/derive-code"],
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
  const closureDecision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t169/derive-code",
    ledger,
    edgeClosureFunctionRef: contract.closureFunctionRef,
    edgeAssuranceCloseDecision: assuranceDecision,
    currentEdgeLawful: true
  });
  assert.equal(ledger.edgeConverged, false);
  assert(
    ledger.edgeResidualPressureRefs.some((ref) =>
      ref.includes("target-carrier")
    )
  );
  assert.equal(closureDecision.disposition, "block");
  assert.equal(closureDecision.targetCarrierContractDigest, row.targetCarrierContractDigest);

  const missing = missingSdlcTargetCarrierAdmission({
    row,
    reason: "worker_report_missing"
  });
  const missingGain = closeReadyGain(edgeRef, missing);
  assert.equal(missingGain.targetCarrierContractRef, row.targetCarrierContractRef);
  assert.equal(
    missingGain.targetCarrierContractDigest,
    row.targetCarrierContractDigest
  );
  assert.equal(missingGain.targetCarrierAdmissionStatus, "missing");
  assert.equal(missingGain.obligationsAndLedgersComplete, true);
  assert(
    missingGain.residualPressureRefs.some((ref) =>
      ref.endsWith("/missing_admission")
    )
  );

  const omittedCarrierLedger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selectedComposition("derive-code/omitted-carrier"),
    ledgerRef: "ledger://t169/derive-code/edge-fulfillment/omitted-carrier",
    ledgerVersionRef:
      "ledger-version://t169/derive-code/edge-fulfillment/omitted-carrier/1",
    edgeAssuranceContractRef: sdlcEdgeAssuranceContractRef(contract),
    edgeAssuranceContractDigest: digestSdlcEdgeGainClosureContract(contract),
    edgeRef: "edge://t169/derive-code",
    attemptRef: "attempt://t169/derive-code/omitted-carrier",
    targetBindingRefs: ["target-binding://t169/derive-code"],
    evidenceBundleRefs: ["evidence://t169/derive-code"],
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
  assert.equal(omittedCarrierLedger.targetCarrierAdmissionStatus, "missing");
  assert.equal(omittedCarrierLedger.edgeConverged, false);
  assert(
    omittedCarrierLedger.edgeResidualPressureRefs.some((ref) =>
      ref.includes("target-carrier")
    )
  );
});
