import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { copyFile, cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { packProduct, productPayloadMembers } from "../../scripts/product-payload.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function directoryMtimes(directory, into = []) {
  into.push((await stat(directory)).mtimeMs);
  for (const entry of await readdir(directory, { withFileTypes: true }))
    if (entry.isDirectory() && !entry.name.startsWith(".")) await directoryMtimes(join(directory, entry.name), into);
  return into;
}

test("TD-69 the payload and its archive are the same whether or not npm trusts its hidden lockfile", async (t) => {
  const generator = await readFile(join(root, "scripts/generate-product-manifest.mjs"), "utf8");
  assert.match(generator, /import \{[^}]*\bproductPayloadMembers\b[^}]*\} from "\.\/product-payload\.mjs";/u);
  assert.doesNotMatch(generator, /"pack"/u, "the generator does not ask npm for the payload");

  // A copy of the built Product root with its complete installed dependency
  // tree, so the hidden lockfile's trust can be set without touching the tenant.
  const scratch = await realpath(await mkdtemp(join(tmpdir(), "abg-t292-payload-")));
  t.after(() => rm(scratch, { force: true, recursive: true }));
  const copyRoot = join(scratch, "product");
  const expected = await productPayloadMembers(root);
  await cp(join(root, "node_modules"), join(copyRoot, "node_modules"), { recursive: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE });
  for (const path of ["package.json", "package-lock.json", ...expected.filter((path) => !path.startsWith("node_modules/"))]) {
    await mkdir(dirname(join(copyRoot, path)), { recursive: true });
    await copyFile(join(root, path), join(copyRoot, path), constants.COPYFILE_FICLONE);
  }

  // npm trusts node_modules/.package-lock.json only while no directory under
  // node_modules is newer than it; trusted, it reads dependency metadata that
  // lacks `files`. Each state is set by the lockfile's own mtime.
  const hiddenLockfile = join(copyRoot, "node_modules/.package-lock.json");
  const newestDirectory = Math.max(...await directoryMtimes(join(copyRoot, "node_modules")));
  const packageDirectory = (await stat(join(copyRoot, "node_modules/fast-check"))).mtimeMs;
  const states = [
    ["trusted", (newestDirectory + 60_000) / 1000, (lock) => assert.ok(lock > newestDirectory, "no directory is newer than the hidden lockfile")],
    ["untrusted", (packageDirectory - 3_600_000) / 1000, (lock) => assert.ok(packageDirectory > lock + 10, "a package directory is newer than the hidden lockfile")],
  ];
  const observed = [];
  for (const [state, seconds, precondition] of states) {
    await utimes(hiddenLockfile, seconds, seconds);
    precondition((await stat(hiddenLockfile)).mtimeMs);
    const { stdout } = await execFileAsync("npm", ["pack", "--dry-run", "--ignore-scripts", "--json"], { cwd: copyRoot, maxBuffer: 64 * 1024 * 1024 });
    const npmProjection = JSON.parse(stdout)[0].files.map(({ path }) => path).sort();
    const members = await productPayloadMembers(copyRoot);
    const destination = join(scratch, `artifacts-${state}`);
    await mkdir(destination);
    const [packed] = await packProduct(copyRoot, destination);
    const archived = packed.files.map(({ path }) => path).sort();
    const artifactDigest = createHash("sha256").update(await readFile(join(destination, packed.filename))).digest("hex");
    t.diagnostic(`${state}: rule ${members.length}, archive ${archived.length} sha256:${artifactDigest}, npm's own projection ${npmProjection.length}` +
      ` (+${npmProjection.filter((path) => !members.includes(path)).join(", ") || "none"})`);
    observed.push({ state, members, archived, artifactDigest });
  }

  const [trusted, untrusted] = observed;
  assert.deepEqual(trusted.members, expected, "the rule over the copy selects the tenant's payload");
  assert.deepEqual(untrusted.members, trusted.members, "the payload list does not depend on npm's hidden lockfile");
  for (const { state, members, archived } of observed) assert.deepEqual(archived, members, `${state}: the archive holds exactly the payload`);
  assert.equal(untrusted.artifactDigest, trusted.artifactDigest, "the archive bytes do not depend on npm's hidden lockfile");
});
