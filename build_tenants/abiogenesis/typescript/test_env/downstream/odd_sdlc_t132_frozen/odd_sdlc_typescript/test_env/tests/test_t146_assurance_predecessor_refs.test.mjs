// Validates: T-146

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF,
  deriveComponentDepthAssuranceLedger,
  deriveSemanticConvergenceAssuranceLedger,
  deriveSdlcOperatorAssuranceGate,
  foldSdlcAssuranceLedgers,
  makeSdlcAssuranceLedger
} from "../../build/semantic/code/src/index.js";

function tmpFile(prefix, name, content) {
  const root = mkdtempSync(join(tmpdir(), prefix));
  const filePath = join(root, name);
  writeFileSync(filePath, content, "utf8");
  return filePath;
}

function passedPostflight() {
  return {
    kind: "sdlc_operator_postflight_result",
    status: "passed",
    blockingReasons: [],
    blockingReasonCarriers: [],
    evidenceRefs: ["postflight://t146/passed"]
  };
}

function manifest(input = {}) {
  return {
    kind: "sdlc_worker_handoff_manifest",
    manifestId: "manifest://t146",
    graphFunctionName: input.graphFunctionName ?? "bootstrap_release_self_test",
    edgeName: input.edgeName ?? "derive_component_test_surface",
    targetAssetType: input.targetAssetType ?? "component_test_surface",
    reportFile: "report://t146/worker",
    archiveRoot: input.archiveRoot ?? "archive://t146",
    productMaterialization: {
      kind: "sdlc_product_materialization_contract",
      required: input.materializationRequired ?? true,
      activeTenant: "scala_spark",
      selectedOutputRoot: "build_tenants/scala_spark",
      tenantRoot: input.tenantRoot ?? "/workspace/build_tenants/scala_spark",
      relativePathBasis: "tenant_root",
      declaredModuleNames: [],
      buildExecutionContract: "sbt clean assembly",
      testExecutionContract: "sbt test",
      manifestFile: "manifest://t146/materialization",
      requiredRoles: ["test"]
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
    graphFunctionName: input.graphFunctionName ?? "bootstrap_release_self_test",
    edgeName: input.edgeName ?? "derive_component_test_surface",
    targetAssetType: input.targetAssetType ?? "component_test_surface",
    outputFile: input.outputFile ?? "output://t146/report",
    digest: "sha256:t146",
    summary: "admitted worker report",
    unresolvedReasons: [],
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

function componentDepthArtifact(register) {
  return tmpFile(
    "odd-sdlc-t146-component-depth-",
    `${register.targetAssetType}.md`,
    `${JSON.stringify(register, null, 2)}\n`
  );
}

test("T-146 assurance fold rejects governing ledgers without predecessor refs", () => {
  const ledger = makeSdlcAssuranceLedger({
    dimension: "materialization",
    verdict: "satisfied",
    evidenceRefs: [],
    predecessorRefs: []
  });
  const satisfaction = foldSdlcAssuranceLedgers({
    requiredDimensions: ["materialization"],
    ledgers: [ledger]
  });

  assert.equal(satisfaction.status, "blocked");
  assert.deepStrictEqual(satisfaction.predecessorCompletenessReasons.map((reason) => reason.code), [
    "assurance_predecessor_refs_missing:materialization"
  ]);
  assert.equal(
    satisfaction.predecessorCompletenessReasons[0].fdMechanicsClassRef,
    SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF
  );
});

test("T-146 operator assurance gate emits replayable predecessor refs", () => {
  const sourceFile = tmpFile(
    "odd-sdlc-t146-gate-",
    "MapperSpec.scala",
    "test(\"mapper\") { assert(Mapper.map(\"ab\") == \"ba\") }\n"
  );
  const outputFile = componentDepthArtifact({
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_surface",
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "MapperSpec",
        relativePath: "src/test/scala/MapperSpec.scala",
        testcaseIds: ["TC-DM-001"],
        componentIds: ["mapper"],
        requirementIds: ["REQ-DM-001"],
        shardId: null
      }
    ]
  });
  const gate = deriveSdlcOperatorAssuranceGate({
    manifest: manifest(),
    report: workerReport({
      outputFile,
      materializedFiles: [
        {
          kind: "sdlc_materialized_product_file",
          role: "test",
          relativePath: "src/test/scala/MapperSpec.scala",
          absolutePath: sourceFile,
          digest: "sha256:test",
          byteCount: 56
        }
      ]
    }),
    postflight: passedPostflight()
  });

  assert.equal(gate.satisfaction.status, "close_allowed");
  assert.equal(gate.satisfaction.predecessorCompletenessReasons.length, 0);
  for (const ledger of gate.ledgers) {
    assert.equal(ledger.fdMechanicsClassRef, SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF);
    assert(ledger.predecessorRefs.length > 0);
  }
});

test("T-146 component-depth assurance cites artifact predecessors and closed F_D class", () => {
  const outputFile = componentDepthArtifact({
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_surface",
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "MapperComponentSpec",
        relativePath: "src/test/scala/MapperComponentSpec.scala",
        testcaseIds: ["TC-DM-001"],
        componentIds: ["mapper"],
        requirementIds: ["REQ-DM-001"],
        shardId: null
      }
    ]
  });
  const ledger = deriveComponentDepthAssuranceLedger({
    manifest: manifest({ targetAssetType: "component_test_surface" }),
    report: workerReport({
      targetAssetType: "component_test_surface",
      outputFile,
      materializedFiles: []
    })
  });

  assert(ledger);
  assert.equal(ledger.fdMechanicsClassRef, SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF);
  assert(ledger.predecessorRefs.includes(outputFile));
  assert(
    ledger.reasons.every(
      (reason) => reason.fdMechanicsClassRef === SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF
    )
  );
});

test("T-146 semantic convergence consumes admitted evaluator facts without rejudging them", () => {
  const ledger = deriveSemanticConvergenceAssuranceLedger({
    targetRefs: ["requirement://REQ-DM-001"],
    claims: [
      {
        kind: "sdlc_semantic_convergence_claim",
        targetRef: "requirement://REQ-DM-001",
        status: "covered",
        evidenceRefs: ["fp-evaluator://t146/claim-covered"],
        predecessorRefs: ["ledger://t146/admitted-evaluator-row"]
      }
    ]
  });
  const satisfaction = foldSdlcAssuranceLedgers({
    requiredDimensions: ["semantic_convergence"],
    ledgers: [ledger]
  });

  assert.equal(ledger.verdict, "satisfied");
  assert.equal(satisfaction.status, "close_allowed");
  assert(ledger.predecessorRefs.includes("ledger://t146/admitted-evaluator-row"));
  assert.equal(ledger.fdMechanicsClassRef, SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF);
});
