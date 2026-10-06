// DRAFT: no effect during preparation. All runtime dependencies resolve through declared package exports.
// Extracted ordinary package loader and Public start construction only.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const schemaVersion='5.0.0',readJson=async p=>JSON.parse(await readFile(p,'utf8')),load=p=>import(pathToFileURL(p).href);
const confined = (root, path) => {
  assert.equal(typeof path, "string");
  const target = resolve(root, path), rel = relative(resolve(root), target);
  assert.ok(rel && !isAbsolute(rel) && rel !== ".." && !rel.startsWith("../"), "declared locator must stay inside its selected package/root");
  return target;
};

/** Resolve only package-declared public exports and bin; callers select the root. */
export async function loadPackageExport(packageRoot, expectedName, exportPath) {
  const manifest = await readJson(join(packageRoot, "package.json"));
  assert.equal(manifest.name, expectedName);
  const entry = manifest.exports?.[exportPath];
  const locator = typeof entry === "string" ? entry : entry?.import;
  assert.equal(typeof locator, "string", `missing declared public export ${expectedName}${exportPath.slice(1)}`);
  return load(confined(packageRoot, locator));
}
export async function declaredCli(packageRoot) {
  const manifest = await readJson(join(packageRoot, "package.json"));
  assert.equal(manifest.name, "@abiogenesis/typescript-tenant");
  assert.equal(typeof manifest.bin?.["abg.cli"], "string", "missing declared abg.cli bin");
  return confined(packageRoot, manifest.bin["abg.cli"]);
}
export const loadRuntime = async root => Object.fromEntries(await Promise.all(
  ["product", "gtl", "abg", "public", "validator"].map(async name =>
    [name, await loadPackageExport(root, "@abiogenesis/typescript-tenant", "./" + name)])));
