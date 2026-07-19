// Validates: T-223 packed public roots initialize without ESM dependency cycles.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const tenantRoot = path.resolve(import.meta.dirname, "../..");

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  return result.stdout;
}

test("T-223 packed root and M03 public imports initialize in fresh processes", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-import-graph-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const packRoot = path.join(root, "pack");
  const consumerRoot = path.join(root, "consumer");
  await mkdir(packRoot, { recursive: true });
  await mkdir(consumerRoot, { recursive: true });

  const packed = JSON.parse(
    run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", packRoot], tenantRoot)
  );
  assert.equal(packed.length, 1);
  const filename = packed[0]?.filename;
  assert.equal(typeof filename, "string");
  await writeFile(
    path.join(consumerRoot, "package.json"),
    JSON.stringify({ name: "t223-import-graph-consumer", private: true, type: "module" })
  );
  run(
    "npm",
    [
      "install",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      path.join(packRoot, filename)
    ],
    consumerRoot
  );

  const probe = `
const root = await import("@abiogenesis/typescript-tenant");
const m03 = await import("@abiogenesis/typescript-tenant/abg/m03");
if (typeof root.canonicalizeIJson !== "function") throw new Error("root API missing");
if (typeof m03.assertRuntimeEvent !== "function") throw new Error("M03 API missing");
`;
  run(process.execPath, ["--input-type=module", "--eval", probe], consumerRoot);
});
