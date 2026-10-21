import assert from "node:assert/strict";
import { readFile, lstat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const recordRoot = fileURLToPath(new URL(".", import.meta.url));
const tenant = join(recordRoot, "stage/build_tenants/abiogenesis/typescript");
const configuration = JSON.parse(await readFile(join(recordRoot, "preflight-configuration.json"), "utf8"));
const product = await import(pathToFileURL(join(tenant, "build/code/src/product/index.js")).href);
const gtl = await import(pathToFileURL(join(tenant, "build/code/src/gtl/index.js")).href);
const { prepareLanguageSmokeFixture } = await import(pathToFileURL(join(tenant, "test_env/support/language-smoke-fixture.mjs")).href);
const manifest = JSON.parse(await readFile(join(tenant, "product-toolchain-manifest.json"), "utf8"));
const abiPackageArchivePath = configuration.abiArchive.path;
const archiveDigest = await product.sha256File(abiPackageArchivePath);
assert.equal(archiveDigest, `sha256:${configuration.abiArchive.sha256}`);
const abiPublication = gtl.constructWorksiteConstructionModulePublication({
  productId: manifest.productId,
  artifactDigest: archiveDigest,
  productContentDigest: manifest.productContentDigest,
  productManifestDigest: product.sha256Canonical(manifest),
  packageName: manifest.packageName,
  packageVersion: manifest.packageVersion,
});
assert.equal(abiPublication.productSemanticsBinding.packageName, manifest.packageName);
assert.equal(abiPublication.productSemanticsBinding.packageVersion, manifest.packageVersion);
const cases = [];
for (const [name, overrides, expected] of [
  ["missing-archive", { abiPackageArchivePath: undefined }, /absolute exact ABI package archive path/],
  ["relative-archive", { abiPackageArchivePath: "relative.tgz" }, /absolute exact ABI package archive path/],
  ["crossed-archive-digest", { abiPublication: { ...abiPublication, artifactDigest: `sha256:${"0".repeat(64)}` } }, /ABI archive differs from its publication/],
]) {
  const scratch = join(recordRoot, "preflight", name);
  await assert.rejects(prepareLanguageSmokeFixture({ scratch, product, gtl, abiPublication, abiPackageArchivePath, ...overrides }), expected);
  await assert.rejects(lstat(scratch), error => error.code === "ENOENT");
  cases.push({ name, status: "refused_before_fixture_write", scratch });
}
const prepared = await prepareLanguageSmokeFixture({
  scratch: join(recordRoot, "preflight/positive"), product, gtl, abiPublication, abiPackageArchivePath,
});
const packageJson = JSON.parse(await readFile(join(prepared.sourceRoot, "package.json"), "utf8"));
assert.deepEqual(packageJson.dependencies, { [manifest.packageName]: `file:${abiPackageArchivePath}` });
assert.deepEqual(prepared.manifest.declaredDependencies, [{
  kind: "requires", productId: manifest.productId, packageVersion: manifest.packageVersion,
  compatibilityRef: "compatibility://abiogenesis/major/5",
  requiredContractRefs: ["abg.contract.gtl.root-declaration", "abg.schema.public-operation-invocation"],
  requiredCapabilityRefs: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.gtl.declare@5"],
}]);
for (const name of ["program.mjs", "leaf.mjs"]) {
  assert.deepEqual(await readFile(join(prepared.sourceRoot, "build", name)),
    await readFile(join(tenant, "test_env/fixtures/language-smoke", name)));
}
const result = {
  status: "satisfied_local_preflight_only", cases,
  abiPublication: {
    owningProductId: abiPublication.owningProductId,
    artifactDigest: abiPublication.artifactDigest,
    productContentDigest: abiPublication.productContentDigest,
    productManifestDigest: abiPublication.productManifestDigest,
    productSemanticsBinding: abiPublication.productSemanticsBinding,
  },
  fixture: {
    artifactPath: prepared.artifactPath, artifactRef: prepared.artifactRef,
    sourceRoot: prepared.sourceRoot, basis: prepared.basis,
    packageDependencies: packageJson.dependencies,
    declaredProductDependencies: prepared.manifest.declaredDependencies,
  },
  fixtureProgramAndLeafBytesUnchanged: true,
  installCalls: 0, eventStoreAcquisitions: 0, publicStartCalls: 0, nativeCalls: 0,
  limit: "Fixture construction and physical package identity only; target dependency materialization and P3 execution remain unobserved.",
};
await writeFile(join(recordRoot, "preflight-result.json"), `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
process.stdout.write(`${JSON.stringify({ status: result.status, fixtureArchive: prepared.artifactPath, cases: cases.length })}\n`);
