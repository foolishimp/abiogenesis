// Validates the installed package's 5.0 live-status hard break.

import assert from "node:assert/strict";
import test from "node:test";

test("M04 live-status hard break: root and M04 package projections expose no legacy carrier", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m04 = await import("@abiogenesis/typescript-tenant/app/m04");

  for (const surface of [root, m04]) {
    assert.equal(Object.hasOwn(surface, "projectLiveStatus"), false);
    assert.equal(Object.hasOwn(surface, "admitPublicLiveStatusRequest"), false);
  }
});
