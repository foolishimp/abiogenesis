// Validates: T-140

import test from "node:test";
import assert from "node:assert/strict";

import {
  sha256DigestForText,
  stableJson,
  stableJsonEquals,
  stableSha256Digest,
  stableSha256HexDigest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

test("T-140 runtime identity helper owns stable JSON and digest prefix policy", () => {
  const left = Object.freeze({
    z: ["last", { b: 2, a: 1 }],
    a: Object.freeze({ nested: true, count: 3 })
  });
  const right = Object.freeze({
    a: Object.freeze({ count: 3, nested: true }),
    z: ["last", { a: 1, b: 2 }]
  });

  assert.equal(stableJson(left), stableJson(right));
  assert.equal(stableJsonEquals(left, right), true);
  assert.equal(stableSha256Digest(left), sha256DigestForText(stableJson(right)));
  assert.match(stableSha256Digest(left), /^sha256:[a-f0-9]{64}$/);
  assert.match(stableSha256HexDigest(left), /^[a-f0-9]{64}$/);
});
