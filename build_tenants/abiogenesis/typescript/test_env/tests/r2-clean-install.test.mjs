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

test("R2 installs the verified artifact into an empty source-blind consumer", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-r2-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts);

  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);

  const bootstrapRoot = join(scratch, "bootstrap");
  await mkdir(bootstrapRoot);
  await execFileAsync("tar", ["-xzf", artifactPath, "-C", bootstrapRoot]);
  const bootstrapPackage = join(bootstrapRoot, "package");
  const product = await import(
    `${pathToFileURL(join(bootstrapPackage, "build/code/src/product/index.js")).href}?artifact=${Date.now()}`
  );
  const packageJson = JSON.parse(await readFile(join(bootstrapPackage, "package.json"), "utf8"));
  const verificationRequest = {
    artifactPath,
    artifactRef: basename(artifactPath),
    expectedProductId: `product://abiogenesis/typescript-tenant@${packageJson.version}`,
    expectedPackageName: packageJson.name,
    expectedPackageVersion: packageJson.version,
  };
  const verified = await product.verifyProduct(verificationRequest);
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));

  const consumerRoot = join(scratch, "consumer");
  const installed = await product.installProduct({
    artifactPath,
    targetRoot: consumerRoot,
    verifiedArtifact: verified,
  });
  assert.equal(installed.disposition, "materialized", JSON.stringify(installed));

  const probe = `
    import { verifyProduct } from "@abiogenesis/typescript-tenant/product";
    const result = await verifyProduct({
      artifactPath: process.env.ABI5_ARTIFACT_PATH,
      artifactRef: process.env.ABI5_ARTIFACT_REF,
      expectedProductId: process.env.ABI5_PRODUCT_ID,
      expectedPackageName: process.env.ABI5_PACKAGE_NAME,
      expectedPackageVersion: process.env.ABI5_PACKAGE_VERSION
    });
    process.stdout.write(JSON.stringify(result));
  `;
  const probeResult = await execFileAsync(
    "node",
    ["--input-type=module", "--eval", probe],
    {
      cwd: consumerRoot,
      env: {
        ...process.env,
        ABI5_ARTIFACT_PATH: artifactPath,
        ABI5_ARTIFACT_REF: basename(artifactPath),
        ABI5_PRODUCT_ID: verified.productId,
        ABI5_PACKAGE_NAME: verified.packageName,
        ABI5_PACKAGE_VERSION: verified.packageVersion,
      },
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  const installedVerification = JSON.parse(probeResult.stdout);
  assert.equal(installedVerification.disposition, "verified");
  assert.equal(installedVerification.artifactDigest, verified.artifactDigest);

  const occupiedRoot = join(scratch, "occupied");
  await mkdir(occupiedRoot);
  await writeFile(join(occupiedRoot, "existing.txt"), "occupied\n", "utf8");
  const refused = await product.installProduct({
    artifactPath,
    targetRoot: occupiedRoot,
    verifiedArtifact: verified,
  });
  assert.equal(refused.disposition, "refused");
  assert.equal(refused.code, "target_not_empty");

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r2.json"),
    `${JSON.stringify(
      {
        kind: "abi5_root_obligation_evidence",
        schemaVersion: "5.0.0",
        bindingId: "ABI5-ROOT-001",
        obligation: "R2_clean_install_complete",
        result: "satisfied",
        sourceImportUsed: false,
        installInputWasEmpty: true,
        lifecycleScriptsEnabled: false,
        networkResolutionEnabled: false,
        verified,
        installed,
        installedExportProbe: {
          packageExport: "@abiogenesis/typescript-tenant/product",
          disposition: installedVerification.disposition,
          artifactDigest: installedVerification.artifactDigest,
        },
        mutation: {
          condition: "installation target contains an existing file",
          expectedRefusal: "target_not_empty",
          observedRefusal: refused.code,
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
});
