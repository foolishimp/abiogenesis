// Derived from design/test-design.md and src/hello.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { helloWorld } from "../../src/hello.mjs";

test("component: helloWorld() returns exactly 'Hello, world!'", () => {
  assert.strictEqual(helloWorld(), "Hello, world!");
});
