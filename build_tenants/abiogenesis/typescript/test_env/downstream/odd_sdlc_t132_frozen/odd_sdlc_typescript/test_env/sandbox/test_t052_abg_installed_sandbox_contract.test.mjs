// Validates: REQ-F-VERIFY-003
// Validates: REQ-F-ODDSDLC-042
// Investigates: T-052

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));

test("T-052 sandbox registry: every TypeScript sandbox consumes the ABG installed-workspace fixture", () => {
  const sandboxTests = readdirSync(TEST_DIR)
    .filter((fileName) => fileName.endsWith(".test.mjs"))
    .filter((fileName) => fileName !== "test_t052_abg_installed_sandbox_contract.test.mjs")
    .sort();

  assert.deepStrictEqual(sandboxTests, [
    "test_b068_enterprise_core_outcome_iteration.test.mjs",
    "test_scenario_sandbox.test.mjs",
    "test_t047_pre_refactor_sandbox.test.mjs",
    "test_t087_t091_t096_internal_data_mapper_induction_sandbox.test.mjs",
    "test_t102_t109_abg37_semantic_ledger_sandbox.test.mjs"
  ]);

  const directAbgContractTests = new Set([
    "test_t102_t109_abg37_semantic_ledger_sandbox.test.mjs"
  ]);

  for (const fileName of sandboxTests) {
    const content = readFileSync(path.join(TEST_DIR, fileName), "utf8");
    const fixtureContent = fileName === "test_scenario_sandbox.test.mjs"
      ? `${content}\n${readFileSync(path.join(TEST_DIR, "scenario_sandbox.mjs"), "utf8")}`
      : content;
    if (directAbgContractTests.has(fileName)) {
      assert(
        content.includes("@abiogenesis/typescript-tenant"),
        `${fileName} must consume the public ABG TypeScript package`
      );
      assert(
        content.includes("3.8.0-rc.3"),
        `${fileName} must pin the ABG 3.8.0-rc.3 contract it verifies`
      );
      continue;
    }
    assert(
      fixtureContent.includes("provisionAbgInstalledSandbox"),
      `${fileName} must provision through the ABG TypeScript installer`
    );
    assert(
      fixtureContent.includes("assertAbgInstalledSandboxEvidence"),
      `${fileName} must assert installed ABG sandbox evidence`
    );
    assert(
      !fixtureContent.includes("M05 sandbox/archive framework exists but is not exported"),
      `${fileName} must not retain the pre-T-076 ABG installer gap`
    );
  }

  const fixture = readFileSync(path.join(TEST_DIR, "abg_installed_workspace.mjs"), "utf8");
  assert(
    fixture.includes("@abiogenesis/typescript-tenant/qualification/m05"),
    "shared sandbox fixture must consume the public ABG M05 archive API"
  );
  assert(
    fixture.includes("m05ArchiveQualification"),
    "shared sandbox fixture must record public M05 archive qualification"
  );
});
