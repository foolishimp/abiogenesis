import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

function runCliAsUser() {
  return spawnSync(process.execPath, ["generated/hello-world.mjs"], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

test("uat: a user running the CLI sees exactly \"Hello, world!\\n\"", () => {
  const result = runCliAsUser();

  assert.equal(result.error, undefined);
  assert.equal(result.status, 0);
  const userVisibleOutput = result.stdout;
  assert.equal(userVisibleOutput, "Hello, world!\n");
});

test("uat: the CLI shows one greeting line, \"Hello, world!\", followed by one newline", () => {
  const result = runCliAsUser();

  assert.equal(result.error, undefined);
  assert.equal(result.status, 0);
  assert.deepEqual(result.stdout.split("\n"), ["Hello, world!", ""]);
});
