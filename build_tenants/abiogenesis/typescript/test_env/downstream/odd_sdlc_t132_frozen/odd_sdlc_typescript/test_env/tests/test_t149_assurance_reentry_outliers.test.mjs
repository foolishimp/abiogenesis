// Validates: T-149

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  constructSdlcEdgeFulfillmentLedger,
  deriveCapabilityAssuranceLedger,
  deriveComponentDepthAssuranceLedger,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcOperatorAssuranceGate,
  foldSdlcAssuranceLedgers
} from "../../build/semantic/code/src/index.js";

function tmpRoot(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

function tmpFile(prefix, name, content) {
  const root = tmpRoot(prefix);
  const filePath = join(root, name);
  writeFileSync(filePath, content, "utf8");
  return filePath;
}

function openEdgeLedger() {
  return constructSdlcEdgeFulfillmentLedger({
    selectedComposition: {
      kind: "sdlc_selected_abg_fn_composition_identity",
      compositionRef: "abg.fn_composition://t149/current",
      compositionDigest: "digest://t149/current",
      compositionSelectionRef: "abg.fn_composition_selection://t149/current",
      selectedRegimeBindingRef:
        "abg.fn_composition.regime_binding://t149/current/evaluate/fp",
      graphFunctionRef: "graph-function://t149/current",
      graphVectorRef: "graph-vector://t149/current",
      basisRef: "basis://t149/current"
    },
    ledgerRef: "ledger://t149/current",
    ledgerVersionRef: "ledger-version://t149/current/1",
    edgeRef: "edge://t149/current",
    attemptRef: "attempt://t149/1",
    targetBindingRefs: ["target-binding://t149/current"],
    evidenceBundleRefs: ["evidence://t149/worksite"],
    materializationRefs: [],
    livenessProjectionRefs: ["liveness://t149/active"],
    admissionRefs: ["admission://t149/assurance"],
    counts: {
      expected: 1,
      fulfilled: 0,
      partial: 1,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
}

function manifest(input = {}) {
  return {
    kind: "sdlc_worker_handoff_manifest",
    manifestId: "manifest://t149",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: input.edgeName ?? "derive_component_code_surface",
    vectorIndex: 149,
    targetAssetType: input.targetAssetType ?? "component_code_surface",
    reportFile: "report://t149/worker",
    archiveRoot: "archive://t149",
    productMaterialization: {
      kind: "sdlc_product_materialization_contract",
      required: false,
      activeTenant: "scala_spark",
      selectedOutputRoot: "build_tenants/scala_spark",
      tenantRoot: "/workspace/build_tenants/scala_spark",
      relativePathBasis: "tenant_root",
      declaredModuleNames: [],
      buildExecutionContract: "sbt clean assembly",
      testExecutionContract: "sbt test",
      manifestFile: "manifest://t149/materialization",
      requiredRoles: []
    },
    traversalObligationContext: {
      kind: "sdlc_traversal_obligation_context",
      obligations: []
    },
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: []
    }
  };
}

function workerReport(input = {}) {
  return {
    kind: "odd_sdlc.worker_result_report",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: input.edgeName ?? "derive_component_code_surface",
    targetAssetType: input.targetAssetType ?? "component_code_surface",
    outputFile: input.outputFile ?? "output://t149/report",
    digest: "sha256:t149",
    summary: input.summary ?? "admitted worker report",
    unresolvedReasons: input.unresolvedReasons ?? [],
    materializedFiles: input.materializedFiles ?? [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: [],
    fpTransformRequestRef: null,
    fpTransformResultRef: null,
    fpTransformStatusSnapshot: null,
    fpEvaluateResultRef: null
  };
}

function passedPostflight() {
  return {
    kind: "sdlc_operator_postflight_result",
    status: "passed",
    blockingReasons: [],
    blockingReasonCarriers: [],
    evidenceRefs: ["postflight://t149/passed"]
  };
}

test("T-149 capability evidence missing with requirement basis routes to repair disposition", () => {
  const capability = deriveCapabilityAssuranceLedger({
    requiredCapabilities: [
      {
        kind: "sdlc_required_capability",
        capabilityId: "lineage_preservation",
        evidenceContract: "lineage links source and target fields",
        requirementRefs: ["requirement://REQ-LIN-001"]
      }
    ],
    observedCapabilities: [
      {
        kind: "sdlc_observed_capability",
        capabilityId: "lineage_preservation",
        evidenceRefs: [],
        substantive: true
      }
    ]
  });
  const satisfaction = foldSdlcAssuranceLedgers({
    requiredDimensions: ["capability"],
    ledgers: [capability]
  });
  const repairReason = satisfaction.gapReasons.find(
    (reason) => reason.code === "capability_evidence_missing:lineage_preservation"
  );
  assert(repairReason);
  assert.equal(repairReason.lawfulReentryPoint, "repair_worker_output");

  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t149/capability-repair",
    ledger: openEdgeLedger(),
    currentEdgeLawful: true,
    repairReasonRefs: [repairReason.code]
  });
  assert.equal(decision.disposition, "repair");
  assert(decision.reasonRefs.includes(repairReason.code));
});

test("T-149 capability evidence missing without basis remains a hard block", () => {
  const capability = deriveCapabilityAssuranceLedger({
    requiredCapabilities: [
      {
        kind: "sdlc_required_capability",
        capabilityId: "lineage_preservation",
        evidenceContract: "lineage links source and target fields",
        requirementRefs: []
      }
    ],
    observedCapabilities: [
      {
        kind: "sdlc_observed_capability",
        capabilityId: "lineage_preservation",
        evidenceRefs: [],
        substantive: true
      }
    ]
  });
  const reason = capability.reasons[0];
  assert.equal(capability.verdict, "blocked");
  assert.equal(reason.code, "capability_evidence_missing_no_basis:lineage_preservation");
  assert.equal(reason.lawfulReentryPoint, "operator_blocked");

  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t149/capability-block",
    ledger: openEdgeLedger(),
    currentEdgeLawful: true,
    blockReasonRefs: [reason.code]
  });
  assert.equal(decision.disposition, "block");
});
test("T-149 malformed component-depth register remains repairable worker output", () => {
  const malformedRegister = tmpFile(
    "odd-sdlc-t149-malformed-component-depth-",
    "component_depth.md",
    "# component depth\n\nNo typed component_depth_register carrier.\n"
  );
  const ledger = deriveComponentDepthAssuranceLedger({
    manifest: manifest(),
    report: workerReport({ outputFile: malformedRegister })
  });
  assert(ledger);
  const reason = ledger.reasons.find(
    (item) => item.code === "component_depth_register_missing"
  );
  assert(reason);
  assert.equal(ledger.verdict, "open_gap");
  assert.equal(reason.lawfulReentryPoint, "repair_worker_output");
});
