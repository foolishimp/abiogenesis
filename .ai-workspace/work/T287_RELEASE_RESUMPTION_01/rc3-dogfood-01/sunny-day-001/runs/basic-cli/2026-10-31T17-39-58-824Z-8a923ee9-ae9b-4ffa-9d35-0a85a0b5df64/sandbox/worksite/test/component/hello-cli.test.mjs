import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

test("component: CLI exits 0 and writes exactly the greeting to stdout", () => {
  const result = spawnSync(process.execPath, ["generated/hello-world.mjs"], {
    cwd: projectRoot,
    encoding: "utf8",
  });

  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "Hello, world!\n");
  assert.equal(result.stderr, "");
});
