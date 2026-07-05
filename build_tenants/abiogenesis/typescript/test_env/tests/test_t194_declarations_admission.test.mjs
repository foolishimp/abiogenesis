import test from "node:test";
import assert from "node:assert/strict";
import { admitSerializedAttrs } from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";

test("T-194 F6: SerializedAttrs admission fails closed on unknown sibling keys", () => {
  // the exact silent-ignore that cost a live-run cycle: a plain key spread
  // next to entries must throw, not vanish
  assert.throws(
    () =>
      admitSerializedAttrs({
        entries: [],
        runtime_registry_candidate_refs: ["registry-entry://x"]
      }),
    /unknown SerializedAttrs key/u
  );
  // lawful typed carrier still admits
  const admitted = admitSerializedAttrs({
    entries: [
      { key: "runtime_registry_candidate_refs", value: { kind: "string_list", value: ["registry-entry://x"] } }
    ]
  });
  assert.equal(admitted.entries.length, 1);
});
