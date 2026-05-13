// Validates: T-132
// Validates: T-130
// Validates: T-131
// Validates: REQ-L-GTL3-GRAPHVECTOR
// Validates: REQ-L-GTL3-HOOKS
// Validates: REQ-L-GTL3-EVALUATOR
// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  installPackedTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "../tests/support/m05-installed-fixtures.mjs";
import { installedT132EdgeAssuranceThreeChainSource } from "../tests/support/t132-edge-assurance-fixtures.mjs";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t132_edge_assurance_installed_live"
);

function liveEnabled() {
  return process.env["ABG_TS_T132_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z") +
    `_pid${process.pid}`;
}

test("T-132 installed live sandbox: ABG installer carries a live F_P edge-assurance eval over the three-edge chain", async (t) => {
  if (!liveEnabled()) {
    t.skip("set ABG_TS_T132_LIVE=1 or CODEX_LIVE_FP=1 to run T-132 live proof");
    return;
  }

  const { targetRoot } = await provisionInstalledRoot();
  await installPackedTenantPackage(targetRoot);
  const archiveRoot = path.join(TEST_RUNS_ROOT, timestampId());

  const run = await runInstalledNodeScript(
    targetRoot,
    installedT132EdgeAssuranceThreeChainSource({ mode: "live", archiveRoot })
  );

  assert.equal(run.status, 0, run.stderr);
  const payload = JSON.parse(run.stdout);

  assert.equal(payload.mode, "live");
  assert.equal(payload.installedPackageSurface, true);
  assert.equal(payload.stageCount, 3);
  assert.deepStrictEqual(payload.closureDecisions, ["close", "close", "close"]);
  assert.deepStrictEqual(payload.nextActionVariantDecisions, {
    retry: "retry",
    qualifiedDefer: "qualified_defer"
  });
  assert.deepStrictEqual(payload.reconstructed, [true, true, true]);
  assert.equal(payload.compound.close, true);
  assert.equal(payload.prematureCompoundCloseRejected, true);
  assert.equal(payload.missingIntermediateRejected, true);
  assert.deepStrictEqual(payload.designSyntaxFacts, [
    {
      edge: "formal_logical_requirements->disambiguated_design_syntax",
      kind: "gtl_disambiguated_design_syntax",
      schemaVersion: "t132.design_syntax.v1",
      syntaxRef: "syntax://t132/disambiguated-design",
      fdValidationRef:
        "fd://t132/logic_to_design_encoding/design-syntax-schema",
      schemaRef: "schema://t132/logic_to_design_encoding/design-syntax-v1",
      graphVectorRef: "graph-t132-logic_to_design_encoding",
      unresolvedRefCount: 0,
      commitmentCount: 1,
      closeFunctionRef: "close://t132/design-syntax/fd-schema-and-fp-assurance"
    }
  ]);
  assert.deepStrictEqual(
    payload.liveArtifacts.map((artifact) => artifact.transportStatus),
    [0, 0, 0]
  );
  assert.ok(
    payload.liveArtifacts.every(
      (artifact) => artifact.transportFailureClass === null
    )
  );
  assert.ok(
    payload.liveArtifacts.every(
      (artifact) =>
        typeof artifact.traceResultPath === "string" &&
        artifact.traceResultPath.startsWith(archiveRoot)
    )
  );
});
