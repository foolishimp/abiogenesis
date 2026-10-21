import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { lstat, readFile, realpath } from "node:fs/promises";
import { join, relative, isAbsolute } from "node:path";
import { createHash } from "node:crypto";

const [fixtureRoot, targetRoot] = process.argv.slice(2);
const packageName = "@abiogenesis/typescript-tenant";
const search = createRequire(join(fixtureRoot, "package.json")).resolve.paths(packageName);
const candidates = [];
for (const root of search) {
  const path = join(root, ...packageName.split("/"));
  try {
    const st = await lstat(path);
    candidates.push({ path, present: true, directory: st.isDirectory(), symlink: st.isSymbolicLink(), realpath: await realpath(path) });
  } catch (error) {
    assert.equal(error.code, "ENOENT");
    candidates.push({ path, present: false });
  }
}
const first = candidates.find(row => row.present);
assert.ok(first);
const relation = relative(targetRoot, first.path);
assert.ok(!isAbsolute(relation) && relation !== ".." && !relation.startsWith("../"));
assert.equal(first.directory, true);
assert.equal(first.symlink, false);
const bytes = await readFile(join(first.path, "product-toolchain-manifest.json"));
process.stdout.write(`${JSON.stringify({ fixtureRoot, targetRoot, packageName, candidates, firstActualPackageRoot: first.path,
  manifestSha256: createHash("sha256").update(bytes).digest("hex"), ownerOperations: 0 }, null, 2)}\n`);
