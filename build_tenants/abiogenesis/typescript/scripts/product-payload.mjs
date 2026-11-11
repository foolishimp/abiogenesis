// The Product payload rule. One function owns which files the Product archive
// holds; the manifest generator digests that list into productContentDigest and
// every tenant pack of the Product root goes through packProduct, which archives
// exactly that list or fails with the difference.
//
// Rule: the payload is every regular file that a package's own package.json
// selects, for the root package and for each package in its lockfile-declared
// bundled-dependency closure. A package selects package.json, its top-level
// README/LICENSE/LICENCE/COPYING files, the targets of main, browser and bin,
// and every file under its `files` entries, or every file in its directory
// when it declares no `files`. Nested node_modules, version-control
// directories and operating-system/editor residue are never selected.
//
// npm's own projection is not the authority: when npm trusts its hidden
// lockfile (node_modules/.package-lock.json) it reads dependency metadata
// without `files` and `main`, and so lists files that the dependency's
// package.json excludes. packProduct therefore packs a staged copy of the
// declared list, where no hidden lockfile exists, and compares the archive.
import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ALWAYS_SELECTED = /^(?:readme|license|licence|copying)(?:\..*[^~$])?$/iu;
const NEVER_SELECTED_DIRECTORIES = new Set([".git", ".svn", ".hg", "CVS"]);
const RESIDUE_FILE = /^(?:\.DS_Store|\._.*|\..*\.swp|.*\.orig|npm-debug\.log|\.npmrc)$/u;
const MANIFEST_PATH = "product-toolchain-manifest.json";

/** Locked package locators of the root's bundled dependencies and of every
 * dependency they require, resolved by Node's nested node_modules lookup. */
export function bundledDependencyClosure(packageJson, packageLock) {
  const names = packageJson.bundleDependencies ?? packageJson.bundledDependencies ?? [];
  if (!Array.isArray(names) ||
      names.some((name) => typeof name !== "string" || packageJson.dependencies?.[name] === undefined))
    throw new Error("bundled runtime dependencies must name exact declared dependencies");
  const locked = packageLock.packages;
  if (locked === null || typeof locked !== "object" || Array.isArray(locked))
    throw new Error("package lock does not expose an installed package inventory");
  const locate = (owner, name) => {
    for (let cursor = owner; cursor !== "";) {
      if (locked[`${cursor}/node_modules/${name}`] !== undefined) return `${cursor}/node_modules/${name}`;
      const marker = cursor.lastIndexOf("/node_modules/");
      cursor = marker === -1 ? "" : cursor.slice(0, marker);
    }
    return locked[`node_modules/${name}`] === undefined ? null : `node_modules/${name}`;
  };
  const pending = names.map((name) => `node_modules/${name}`), visited = new Set();
  while (pending.length > 0) {
    const locator = pending.pop();
    if (visited.has(locator)) continue;
    const entry = locked[locator];
    if (entry === null || typeof entry !== "object" || Array.isArray(entry))
      throw new Error(`bundled dependency is absent from package lock: ${locator}`);
    visited.add(locator);
    for (const name of Object.keys(entry.dependencies ?? {}).sort()) {
      const dependency = locate(locator, name);
      if (dependency === null) throw new Error(`bundled dependency closure is incomplete: ${locator} -> ${name}`);
      pending.push(dependency);
    }
    for (const name of Object.keys(entry.optionalDependencies ?? {}).sort()) {
      const dependency = locate(locator, name);
      if (dependency !== null) pending.push(dependency);
    }
  }
  return [...visited].sort();
}

/** A package-relative path from a `files` entry or a main/browser/bin target;
 * only literal paths, `dir/` and `dir/**` are admitted. */
function literalEntry(owner, value) {
  if (typeof value !== "string") throw new Error(`${owner} names a non-string package path`);
  const path = posix.normalize(value.replace(/\/\*\*$/u, "")).replace(/^\.\//u, "").replace(/\/$/u, "");
  if (path === "" || path === "." || path.startsWith("../") || path === ".." || path.startsWith("/") || /[*?[\]{}!\\]/u.test(path))
    throw new Error(`${owner} names a package path outside the literal payload rule: ${value}`);
  return path;
}

async function selectTree(root, relativePath, into, skipNodeModules) {
  const absolute = join(root, relativePath);
  let stat;
  try { stat = await lstat(absolute); } catch (error) { if (error.code === "ENOENT") return; throw error; }
  if (stat.isSymbolicLink()) throw new Error(`refusing symbolic-link payload: ${relativePath}`);
  if (stat.isFile()) { if (!RESIDUE_FILE.test(posix.basename(relativePath))) into.add(relativePath); return; }
  if (!stat.isDirectory()) throw new Error(`refusing non-file payload member: ${relativePath}`);
  for (const name of (await readdir(absolute)).sort()) {
    if (NEVER_SELECTED_DIRECTORIES.has(name) || (skipNodeModules && name === "node_modules")) continue;
    await selectTree(root, relativePath === "" ? name : `${relativePath}/${name}`, into, false);
  }
}

async function selectPackage(root, packagePath, into) {
  const manifest = JSON.parse(await readFile(join(root, packagePath, "package.json"), "utf8"));
  const owner = `${packagePath || "root"} package.json`;
  const prefix = packagePath === "" ? "" : `${packagePath}/`;
  if (manifest.files === undefined) return selectTree(root, packagePath, into, true);
  if (!Array.isArray(manifest.files)) throw new Error(`${owner} declares a non-array files field`);
  const named = new Set(["package.json"]);
  for (const name of await readdir(join(root, packagePath))) if (ALWAYS_SELECTED.test(name)) named.add(name);
  const bin = typeof manifest.bin === "string" ? [manifest.bin] : Object.values(manifest.bin ?? {});
  for (const target of [manifest.main, typeof manifest.browser === "string" ? manifest.browser : undefined, ...bin])
    if (target !== undefined) named.add(literalEntry(owner, target));
  for (const entry of manifest.files) named.add(literalEntry(owner, entry));
  for (const path of [...named].sort()) {
    if (path === "node_modules" || path.startsWith("node_modules/")) throw new Error(`${owner} selects its nested node_modules`);
    await selectTree(root, prefix + path, into, false);
  }
}

/** Every archive member of the Product at packageRoot, sorted: the payload rule
 * applied to the root package and its bundled-dependency closure. */
export async function productPayloadMembers(packageRoot) {
  const root = resolve(packageRoot);
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const packageLock = JSON.parse(await readFile(join(root, "package-lock.json"), "utf8"));
  const members = new Set();
  await selectPackage(root, "", members);
  for (const locator of bundledDependencyClosure(packageJson, packageLock)) await selectPackage(root, locator, members);
  for (const path of members)
    if (posix.normalize(path) !== path || path.startsWith("../") || posix.isAbsolute(path))
      throw new Error(`payload rule selected an unsafe Product path: ${path}`);
  return [...members].sort();
}

function difference(expected, actual) {
  const expectedSet = new Set(expected), actualSet = new Set(actual);
  return { missing: expected.filter((path) => !actualSet.has(path)), unexpected: actual.filter((path) => !expectedSet.has(path)) };
}

/** Packs the Product at packageRoot into destination and returns npm's
 * `pack --json` result. The archive holds exactly productPayloadMembers, which
 * must equal the built manifest's locators plus its two generated members. */
export async function packProduct(packageRoot, destination) {
  const root = resolve(packageRoot);
  const members = await productPayloadMembers(root);
  const manifest = JSON.parse(await readFile(join(root, MANIFEST_PATH), "utf8"));
  const generated = [MANIFEST_PATH, manifest.capabilityDefinitionGraph?.assetLocator?.path];
  const declared = members.filter((path) => !generated.includes(path));
  if (generated.some((path) => !members.includes(path)) || JSON.stringify(declared) !== JSON.stringify(manifest.productRelativeLocators))
    throw new Error(`built manifest differs from the payload rule; rebuild: ${JSON.stringify(difference(manifest.productRelativeLocators, declared))}`);
  const stage = await realpath(await mkdtemp(join(tmpdir(), "abg-product-pack-")));
  try {
    const directories = new Set();
    for (const path of members) {
      const target = join(stage, path);
      if (!directories.has(dirname(target))) { await mkdir(dirname(target), { recursive: true }); directories.add(dirname(target)); }
      await copyFile(join(root, path), target, constants.COPYFILE_FICLONE);
    }
    const { stdout } = await execFileAsync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", resolve(destination)],
      { cwd: stage, maxBuffer: 64 * 1024 * 1024 });
    const result = JSON.parse(stdout);
    if (!Array.isArray(result) || result.length !== 1 || !Array.isArray(result[0]?.files))
      throw new Error("npm pack did not return one archive");
    const archived = result[0].files.map(({ path }) => path).sort();
    if (JSON.stringify(archived) !== JSON.stringify(members))
      throw new Error(`npm archive differs from the payload rule: ${JSON.stringify(difference(members, archived))}`);
    return result;
  } finally {
    await rm(stage, { force: true, recursive: true });
  }
}

// Command entry for callers outside the tenant, such as the release cut:
//   node scripts/product-payload.mjs members
//   node scripts/product-payload.mjs pack <destination>
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const [command, destination] = process.argv.slice(2);
  if (command === "members") process.stdout.write(`${JSON.stringify(await productPayloadMembers(root), null, 2)}\n`);
  else if (command === "pack" && destination !== undefined) process.stdout.write(`${JSON.stringify(await packProduct(root, destination), null, 2)}\n`);
  else { process.stderr.write("usage: product-payload.mjs members | pack <destination>\n"); process.exitCode = 2; }
}
