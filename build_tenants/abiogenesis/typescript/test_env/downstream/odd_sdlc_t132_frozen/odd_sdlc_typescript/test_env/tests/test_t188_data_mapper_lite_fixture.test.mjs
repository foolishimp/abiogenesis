// Validates: T-188

import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  constructWorkerInvocationPackage,
  deriveWorkerHandoffManifest,
  hookContractByEdgeName
} from "../../build/semantic/code/src/index.js";

import {
  DATA_MAPPER_LITE_FIXTURE_ROOT,
  DATA_MAPPER_LITE_SELECTED_REQUIREMENT_IDS,
  DATA_MAPPER_LITE_SOURCE_FILES,
  assertDataMapperLiteFixtureTraceability
} from "../fixtures/data_mapper_lite_fixture.mjs";
import {
  DATA_MAPPER_TEMPLATE_ROOT_ENV,
  canonicalDataMapperFixtureRoot
} from "../fixtures/data_mapper_fixture.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, "../..");

test("T-188 data_mapper-lite fixture is sourced from canonical requirement IDs", () => {
  assertDataMapperLiteFixtureTraceability();
  for (const rel of DATA_MAPPER_LITE_SOURCE_FILES) {
    assert.equal(
      existsSync(path.join(DATA_MAPPER_LITE_FIXTURE_ROOT, rel)),
      true,
      rel
    );
  }
  for (const rel of [
    "build_tenants/data_mapper_lite_javascript/package.json",
    "build_tenants/data_mapper_lite_javascript/src/topology.js",
    "build_tenants/data_mapper_lite_javascript/test/topology.test.js"
  ]) {
    assert.equal(
      existsSync(path.join(DATA_MAPPER_LITE_FIXTURE_ROOT, rel)),
      false,
      `fixture must not include generated product file ${rel}`
    );
  }
});

test("T-188 data_mapper-lite lifecycle runner binds the lite fixture and test lifecycle", () => {
  const runner = readFileSync(
    path.join(PACKAGE_ROOT, "test_env/live/run_t188_data_mapper_lite_lifecycle.mjs"),
    "utf8"
  );
  const fixtureRequirements = readFileSync(
    path.join(DATA_MAPPER_LITE_FIXTURE_ROOT, "specification/REQUIREMENTS.md"),
    "utf8"
  );
  assert.match(runner, /ODD_SDLC_DATA_MAPPER_TEMPLATE_ROOT/u);
  assert.match(runner, /DATA_MAPPER_LITE_FIXTURE_ROOT/u);
  assert.match(runner, /derive_test_execution_result_surface/u);
  assert.match(runner, /executionEvidenceTestsObserved/u);
  for (const requirementId of DATA_MAPPER_LITE_SELECTED_REQUIREMENT_IDS) {
    assert.match(fixtureRequirements, new RegExp(requirementId, "u"));
  }
});

test("T-188 data_mapper internal scenarios reject external template roots", () => {
  const prior = process.env[DATA_MAPPER_TEMPLATE_ROOT_ENV];
  try {
    process.env[DATA_MAPPER_TEMPLATE_ROOT_ENV] =
      "/external/data_mapper.template";
    assert.throws(
      () => canonicalDataMapperFixtureRoot(),
      /External data_mapper\.template roots are not valid for internal scenarios/u
    );
    process.env[DATA_MAPPER_TEMPLATE_ROOT_ENV] = DATA_MAPPER_LITE_FIXTURE_ROOT;
    assert.equal(canonicalDataMapperFixtureRoot(), DATA_MAPPER_LITE_FIXTURE_ROOT);
  } finally {
    if (prior === undefined) {
      delete process.env[DATA_MAPPER_TEMPLATE_ROOT_ENV];
    } else {
      process.env[DATA_MAPPER_TEMPLATE_ROOT_ENV] = prior;
    }
  }
});

test("T-188 component-code invocation keeps test module pressure downstream", () => {
  const workspaceRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t188-lite-"));
  cpSync(DATA_MAPPER_LITE_FIXTURE_ROOT, workspaceRoot, { recursive: true });
  const contract = hookContractByEdgeName("derive_component_code_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "derive_component_code_surface",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t188-component-code-module-role"
  });
  const invocationPackage = constructWorkerInvocationPackage({ manifest });

  assert.deepStrictEqual(manifest.productMaterialization.requiredRoles, ["source"]);
  assert.deepStrictEqual(manifest.productMaterialization.declaredModuleNames, [
    "src",
    "test"
  ]);
  const traversalObligationIds = manifest.traversalObligationContext.obligations.map(
    (obligation) => obligation.obligationId
  );
  assert.equal(traversalObligationIds.includes("module:src"), true);
  assert.equal(traversalObligationIds.includes("module:test"), false);
  assert.equal(invocationPackage.inlineObligationIds.includes("module:src"), true);
  assert.equal(invocationPackage.inlineObligationIds.includes("module:test"), false);
  assert.equal(invocationPackage.outputContract.requiredRoles.includes("test"), false);
});
