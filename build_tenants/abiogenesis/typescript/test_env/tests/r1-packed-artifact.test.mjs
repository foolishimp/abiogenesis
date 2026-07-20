import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("R1 verifies exact packed bytes without a source import", async (context) => {
  const artifacts = join(root, "artifacts");
  await rm(artifacts, { force: true, recursive: true });
  await mkdir(artifacts, { recursive: true });

  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  assert.equal(typeof packResult.filename, "string");

  const artifactPath = join(artifacts, packResult.filename);
  const extractRoot = await mkdtemp(join(tmpdir(), "abi5-r1-"));
  context.after(async () => rm(extractRoot, { force: true, recursive: true }));
  await execFileAsync("tar", ["-xzf", artifactPath, "-C", extractRoot]);

  const productRoot = join(extractRoot, "package");
  const packageJson = JSON.parse(await readFile(join(productRoot, "package.json"), "utf8"));
  const productModulePath = join(productRoot, "build/code/src/product/index.js");
  const product = await import(`${pathToFileURL(productModulePath).href}?artifact=${Date.now()}`);

  const request = {
    artifactPath,
    artifactRef: basename(artifactPath),
    expectedProductId: `product://abiogenesis/typescript-tenant@${packageJson.version}`,
    expectedPackageName: packageJson.name,
    expectedPackageVersion: packageJson.version,
  };
  const verified = await product.verifyProduct(request);
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));
  assert.equal(verified.kind, "verified_product_artifact");
  assert.equal(verified.checkedPayloadFiles > 0, true);

  const tamperedPath = join(productRoot, "build/code/src/index.js");
  const original = await readFile(tamperedPath, "utf8");
  await writeFile(tamperedPath, `${original}\n`, "utf8");
  const tamperedArtifactPath = join(artifacts, "tampered-abiogenesis-typescript-tenant.tgz");
  await execFileAsync("tar", ["-czf", tamperedArtifactPath, "-C", extractRoot, "package"]);
  const refused = await product.verifyProduct({
    ...request,
    artifactPath: tamperedArtifactPath,
    artifactRef: basename(tamperedArtifactPath),
  });
  assert.equal(refused.disposition, "refused");
  assert.equal(refused.code, "product_content_mismatch");

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r1.json"),
    `${JSON.stringify(
      {
        kind: "abi5_root_obligation_evidence",
        schemaVersion: "5.0.0",
        bindingId: "ABI5-ROOT-001",
        obligation: "R1_exact_artifacts_verified",
        result: "satisfied",
        sourceImportUsed: false,
        package: {
          name: packageJson.name,
          version: packageJson.version,
          npmIntegrity: packResult.integrity,
          npmShasum: packResult.shasum,
        },
        verified,
        mutation: {
          changedPath: "build/code/src/index.js",
          expectedRefusal: "product_content_mismatch",
          observedRefusal: refused.code,
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
});
