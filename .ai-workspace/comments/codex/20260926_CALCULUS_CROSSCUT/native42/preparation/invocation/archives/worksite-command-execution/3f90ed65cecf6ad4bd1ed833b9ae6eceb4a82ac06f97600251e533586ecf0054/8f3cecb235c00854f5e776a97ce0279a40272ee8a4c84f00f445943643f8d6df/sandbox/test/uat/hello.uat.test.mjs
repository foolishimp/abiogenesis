// Derived from test/component/hello.test.mjs, design/test-design.md and src/hello.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { helloWorld } from "../../src/hello.mjs";

test("uat: the user-visible greeting contract is exactly 'Hello, world!'", () => {
  assert.strictEqual(helloWorld(), "Hello, world!");
});
