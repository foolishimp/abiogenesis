// Validates: REQ-F-ODDSDLC-059
// Validates: REQ-F-ODDSDLC-060
// Validates: T-099

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  deriveWorkerHandoffManifest,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t099-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nBuild with indexed pressure and module tranches.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    "# Product\n\nA tranche-planned fixture product.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    "# Goals\n\n- prove compact indexed pressure\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t099_fixture",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt",
      "    module_structure:",
      "      - pressure-core",
      "      - pressure-runtime"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-many-requirements.md"),
    [
      "# Many Requirements",
      "",
      ...Array.from({ length: 50 }, (_, index) => {
        const id = String(index + 1).padStart(3, "0");
        return `REQ-T099-${id}: Indexed pressure requirement ${id} with concrete acceptance text VERY_LONG_T099_MARKER_${id}.`;
      })
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

test("T-099 prompt-bearing handoff carries indexed authority and compact pressure", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 12,
    contract,
    runId: "t099-indexed-pressure"
  });
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");
  const manifestText = readFileSync(files.manifestPath, "utf8");
  const manifestOnDisk = JSON.parse(manifestText);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const requirement050 = manifest.traversalObligationContext.obligations.find(
    (obligation) =>
      obligation.obligationKind === "requirement" &&
      obligation.summary.includes("REQ-T099-050")
  );
  assert(requirement050);

  assert.equal(existsSync(files.manifestPath), true);
  assert.equal(
    existsSync(path.join(manifest.archiveRoot, "traversal_intent_package.json")),
    true
  );
  assert(
    manifest.traversalObligationContext.authorityIndex.some(
      (entry) => entry.category === "requirements"
    )
  );
  assert(
    manifest.traversalObligationContext.trancheKeys.includes(
      "module:pressure-core"
    )
  );
  assert(
    manifest.traversalObligationContext.trancheKeys.includes(
      "realization:tranche_execution"
    )
  );
  assert(
    manifest.traversalObligationContext.retrievalHints.some(
      (hint) => hint.obligationIds.includes(requirement050.obligationId)
    )
  );

  assert.match(prompt, /Read in order:/);
  assert.match(prompt, /construction brief:/);
  assert.match(prompt, /worker brief projection:/);
  assert.match(prompt, /invocation package projection:/);
  assert.match(prompt, /traversal intent projection:/);
  assert.match(prompt, /forensic manifest only when a package ref requires it:/);
  assert.doesNotMatch(prompt, /Compact worker invocation package/);
  assert.doesNotMatch(prompt, /"packageVersion": "ts-invocation-v1"/);
  assert.doesNotMatch(prompt, /"omittedObligationCount":/);
  assert.doesNotMatch(prompt, /"requirementTraceObligationIds":/);
  assert.doesNotMatch(prompt, /"requirement:REQ-T099-050"/);
  assert.doesNotMatch(prompt, /"trancheKeys":/);
  assert.doesNotMatch(prompt, /VERY_LONG_T099_MARKER_050/);
  assert.equal(invocationPackage.packageVersion, "ts-invocation-v1");
  assert.equal(typeof invocationPackage.omittedObligationCount, "number");
  assert(
    invocationPackage.requirementTraceObligationIds.includes(
      requirement050.obligationId
    )
  );
  assert(
    invocationPackage.retrievalHints.every(
      (hint) => hint.obligationIds.length <= 12
    )
  );
  assert(invocationPackage.trancheKeys.length > 0);
  assert.match(manifestText, /VERY_LONG_T099_MARKER_050/);
  assert.deepEqual(
    manifestOnDisk.traversalObligationContext.trancheKeys,
    manifest.traversalObligationContext.trancheKeys
  );
});

test("T-099 test-design prompt carries execution schedule rows and qualification tranches", () => {
  const workspace = makeWorkspace();
  const contract = hookContractByEdgeName("derive_test_design_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspace,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 17,
    contract,
    runId: "t099-test-design-schedule-rows"
  });
  const files = writeHandoffFiles(manifest);
  const prompt = readFileSync(files.promptPath, "utf8");

  assert.match(prompt, /testExecutionScheduleRows/u);
  assert.match(prompt, /sdlc_test_execution_schedule_row/u);
  assert.match(prompt, /declared test execution contract/u);
  assert(
    manifest.traversalObligationContext.trancheKeys.includes(
      "qualification:tranche_execution"
    )
  );
});
