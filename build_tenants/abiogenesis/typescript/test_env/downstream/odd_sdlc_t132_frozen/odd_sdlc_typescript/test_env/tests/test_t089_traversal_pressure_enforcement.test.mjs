// Validates: REQ-F-ODDSDLC-013
// Validates: REQ-F-ODDSDLC-014
// Validates: REQ-F-ODDSDLC-053
// Validates: REQ-F-ODDSDLC-074
// Validates: T-089

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  deriveWorkerHandoffManifest,
  evaluateSdlcComputeStage,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  sha256Text,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t089-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    ["# T-089 Fixture", "", "REQ-T089-001: Preserve pressure on early prompt edges."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    ["# Intent", "", "INT-T089: Test early traversal pressure."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-t089.md"),
    ["# Requirements", "", "REQ-T089-002: Every prompt edge must carry obligations."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t089_pressure",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "ambiguity_risk_appetite: medium"
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function earlyManifest(workspaceRoot) {
  const contract = hookContractByEdgeName("derive_intent_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t089-early-pressure"
  });
  writeHandoffFiles(manifest);
  return manifest;
}

function writeOutput(manifest) {
  const output = "# Intent Surface\n\nA governed project intent surface.\n";
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, output, "utf8");
  return { output, digest: sha256Text(output) };
}

function reportFor(manifest, overrides = {}) {
  const output = writeOutput(manifest);
  return {
    kind: "odd_sdlc.worker_result_report",
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: output.digest,
    summary: "Generated early intent surface.",
    unresolvedReasons: [],
    materializedFiles: [],
    executionEvidence: null,
    obligationAssessments: [],
    ...overrides
  };
}

test("T-089 early non-materializing edge keeps evaluator contract separate from transform obligations", () => {
  const manifest = earlyManifest(makeWorkspace());
  const obligations = manifest.traversalObligationContext.obligations;

  assert.equal(manifest.productMaterialization.required, false);
  assert(obligations.length > 0);
  assert(
    manifest.traversalIntentPackage.obligationIds.includes(
      `target_asset:${manifest.targetAssetType}`
    )
  );
  assert(
    obligations.every(
      (obligation) => !obligation.obligationId.startsWith("evaluator:")
    )
  );
  assert.equal(
    manifest.traversalIntentPackage.evaluatorExpectations.kind,
    "sdlc_hook_transform_profile"
  );
  assert(
    manifest.traversalIntentPackage.evaluatorExpectations.postflightFd.length > 0
  );
  assert(
    obligations.some((obligation) =>
      obligation.obligationKind === "requirement" &&
      obligation.summary.includes("REQ-T089-002")
    )
  );
});
test("T-089 postflight admits fulfilled obligation coverage on early edge", () => {
  const manifest = earlyManifest(makeWorkspace());
  const report = reportFor(manifest, {
    obligationAssessments: manifest.traversalObligationContext.obligations.map(
      (obligation) => ({
        kind: "sdlc_worker_obligation_assessment",
        obligationId: obligation.obligationId,
        fulfillmentStatus: "fulfilled",
        evidenceRefs: [manifest.outputFile],
        blockingReasons: []
      })
    )
  });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
  assert.deepEqual(postflight.blockingReasons, []);
});
