// Validates: REQ-F-ODDSDLC-040
// Validates: REQ-F-ODDSDLC-043
// Investigates: T-027

import test from "node:test";
import assert from "node:assert/strict";

import {
  ODD_SDLC_TYPESCRIPT_TENANT_KIND,
  ODD_SDLC_TYPESCRIPT_TENANT_STATUS,
  ODD_SDLC_TYPESCRIPT_TENANT_CAPABILITIES,
  describeOddSdlcTypescriptTenant
} from "../../build/semantic/code/src/index.js";

test("T-027 scaffold keeps explicit tenant identity after later build tickets", () => {
  assert.equal(ODD_SDLC_TYPESCRIPT_TENANT_KIND, "odd_sdlc_typescript_tenant");
  assert.equal(ODD_SDLC_TYPESCRIPT_TENANT_STATUS, "bounded_rc_qualified");
  assert(ODD_SDLC_TYPESCRIPT_TENANT_CAPABILITIES.includes("hook_contracts"));
  assert.deepStrictEqual(describeOddSdlcTypescriptTenant(), {
    kind: "odd_sdlc_typescript_tenant",
    status: "bounded_rc_qualified",
    product: "odd_sdlc",
    capabilities: ODD_SDLC_TYPESCRIPT_TENANT_CAPABILITIES
  });
});
