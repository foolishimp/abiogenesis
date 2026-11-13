import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

test("uat: user running the CLI sees exactly \"Hello, world!\" and one newline", () => {
  const result = spawnSync(process.execPath, ["generated/hello-world.mjs"], {
    cwd: projectRoot,
    encoding: "utf8",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "Hello, world!\n");
  assert.deepEqual(result.stdout.split("\n"), ["Hello, world!", ""]);
  assert.equal(result.stderr, "");
});
