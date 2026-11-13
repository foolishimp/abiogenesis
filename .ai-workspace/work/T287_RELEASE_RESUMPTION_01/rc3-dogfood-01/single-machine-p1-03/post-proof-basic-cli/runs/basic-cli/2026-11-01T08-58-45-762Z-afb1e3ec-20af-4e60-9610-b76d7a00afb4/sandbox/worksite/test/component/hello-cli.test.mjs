import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

function runCli(options = {}) {
  return spawnSync(process.execPath, ["generated/hello-world.mjs"], {
    cwd: projectRoot,
    ...options,
  });
}

test("component: hello-world CLI exits 0 and writes exactly \"Hello, world!\\n\" to stdout", () => {
  const result = runCli({ encoding: "utf8" });

  assert.equal(result.error, undefined);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "Hello, world!\n");
});

test("component: hello-world CLI stdout is byte-exact with one trailing newline", () => {
  const result = runCli();

  assert.equal(result.error, undefined);
  assert.equal(result.status, 0);
  assert.equal(result.signal, null);
  assert.deepEqual(result.stdout, Buffer.from("Hello, world!\n", "utf8"));
});
