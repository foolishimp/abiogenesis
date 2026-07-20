// Validates the 5.0 hard break from the caller-owned live-status carrier.

import assert from "node:assert/strict";
import test from "node:test";

import * as m04 from "../../build/semantic/code/src/app/m04/index.js";

test("M04 live-status hard break: the source barrel exposes no legacy status authority", () => {
  for (const exportName of [
    "admitPublicLiveStatusRequest",
    "constructPublicLiveStatusRequest",
    "projectLiveStatus",
    "projectLiveStatusFromRequest"
  ]) {
    assert.equal(
      Object.hasOwn(m04, exportName),
      false,
      `${exportName} must not survive the public M04 barrel`
    );
  }
});
