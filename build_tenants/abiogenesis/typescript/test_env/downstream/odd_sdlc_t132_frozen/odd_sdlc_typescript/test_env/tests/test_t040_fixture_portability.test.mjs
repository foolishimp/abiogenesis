// Validates: SPEC_METHOD fixture and proof portability rule
// Investigates: T-040

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("T-040 semantic lane excludes optional reference fixtures from required closure", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  assert.match(packageJson.scripts["test:semantic"], /\*\.test\.mjs/);
  assert.match(
    packageJson.scripts["test:reference:data-mapper"],
    /test_t031_data_mapper_reference\.reference\.mjs/
  );

  const portableT031 = readFileSync(
    "test_env/tests/test_t031_workspace_ingress.test.mjs",
    "utf8"
  );
  assert.equal(portableT031.includes("data_mapper_fixture"), false);
  assert.equal(portableT031.includes("ODD_SDLC_DATA_MAPPER_TEMPLATE_ROOT"), false);

  const manifest = readFileSync(
    "test_env/fixtures/data_mapper_reference_manifest.md",
    "utf8"
  );
  assert.match(manifest, /Lane: optional local reference comparison/);
  assert.match(manifest, /test_env\/fixtures\/data_mapper_reference\/data_mapper\.template/);
  assert.match(manifest, /ODD_SDLC_DATA_MAPPER_TEMPLATE_ROOT/);
  assert.match(manifest, /internal fixture selector only/);
  assert.match(manifest, /must not\s+read or write `ai_sdlc_examples` template roots/u);
});
