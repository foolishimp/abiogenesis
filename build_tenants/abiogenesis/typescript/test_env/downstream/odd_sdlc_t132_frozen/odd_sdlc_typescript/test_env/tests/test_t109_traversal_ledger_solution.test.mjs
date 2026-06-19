// Validates: T-109
// Validates: semantic-ledger-proof-routing

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as oddSdlcTenant from "../../build/semantic/code/src/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");

test("T-109 local product-ledger API is retired in favor of the semantic-ledger sandbox lane", () => {
  const packageJson = JSON.parse(
    readFileSync(path.join(PACKAGE_ROOT, "package.json"), "utf8")
  );

  assert.equal(
    packageJson.scripts["test:t102-t110:semantic-ledger-sandbox"].includes(
      "semantic_ledger_sandbox.test.mjs"
    ),
    true
  );

  for (const retiredExport of [
    "appendProjectConstructionLedgerEntrySync",
    "classifyRetry",
    "constructEdgeFulfillmentLedger",
    "edgeConverged",
    "projectConstructionLedger",
    "selectCurrentEdgeLedger"
  ]) {
    assert.equal(
      Object.hasOwn(oddSdlcTenant, retiredExport),
      false,
      `${retiredExport} must not reappear as odd_sdlc-local runtime ledger law`
    );
  }
});
