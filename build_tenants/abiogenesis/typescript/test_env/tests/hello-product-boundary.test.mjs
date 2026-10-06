import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL("../..", import.meta.url));
const removedAuthority = /(?:HELLO_WORLD|FP_HELLO|COMPOSED_HELLO|GATE_HELLO|GRAPH_EDGE_HELLO|SUBSTITUTED_HELLO|WORKFLOW_HELLO|RECURSION_HELLO|FAN_OUT_HELLO|HelloWorldInput|FpHelloInstruction|FanOutHello|BoundedRecursionState|hello_world_input|hello_world_output|normalized_hello_input|fan_out_hello_|(?:program|module|graph-function|contract|implementation)(?:-binding)?:\/\/abiogenesis\/conformance\/(?:[^\s"']*hello|bounded-recursion|fan-out))/u;
const removedModule = /(?:^|\/)build\/code\/src\/(?:gtl\/(?:hello_world|fan_out|recursion)|implementation\/(?:hello_world|fp_hello|hello_gate|hello_compose|fan_out|recursion))\.(?:js|d\.ts)$/u;

async function files(rootPath) {
  const result = [];
  for (const entry of await readdir(rootPath, { withFileTypes: true })) {
    const path = join(rootPath, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

test("the minimal language test has no production authority or package entry", async context => {
  for (const path of await files(join(root, "code/src"))) {
    assert.equal(removedAuthority.test(await readFile(path, "utf8")), false,
      `test-specific authority leaked into production: ${path}`);
  }
  const scratch = await mkdtemp(join(tmpdir(), "abi5-no-built-in-hello-"));
  context.after(async () => rm(scratch, { recursive: true, force: true }));
  let archive = process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH;
  if (archive === undefined) {
    const { stdout } = await execFileAsync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", scratch],
      { cwd: root, maxBuffer: 10 * 1024 * 1024 });
    const [pack] = JSON.parse(stdout);
    archive = join(scratch, pack.filename);
  }
  const members = (await execFileAsync("tar", ["-tzf", archive])).stdout.trim().split("\n");
  assert.equal(members.some(path => removedModule.test(path)), false, "removed production implementation remains packed");
  assert.equal(members.some(path => /(?:test_env|language-smoke|language-fixtures)/u.test(path)), false,
    "test-owned program/leaf/provider leaked into the ABG package");
  await execFileAsync("tar", ["-xzf", archive, "-C", scratch]);
  const packedRoot = join(scratch, "package");
  for (const path of await files(join(packedRoot, "build/code/src"))) {
    assert.equal(removedAuthority.test(await readFile(path, "utf8")), false,
      `test-specific authority remains in generated package code: ${path}`);
  }
  const manifest = JSON.parse(await readFile(join(packedRoot, "product-toolchain-manifest.json"), "utf8"));
  for (const row of manifest.contributionManifest.rows) {
    assert.equal(removedAuthority.test(JSON.stringify(row)), false, "Product catalog publishes a built-in test application");
    assert.equal(JSON.stringify(row).includes("abi5-tests"), false, "Product catalog publishes the independent test fixture");
  }
  for (const row of manifest.publicContractCatalog.rows) {
    assert.equal(removedAuthority.test(JSON.stringify(row)), false, "Product contract catalog publishes built-in test contracts");
  }
});
