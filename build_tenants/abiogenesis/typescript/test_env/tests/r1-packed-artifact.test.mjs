import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { packProduct } from "../../scripts/product-payload.mjs";
import test from "node:test";

import {
  candidateBasisSource,
  expectedCandidateBasis,
  expectedVerificationIdentity,
} from "../support/candidate-basis.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// The expected identity has two sources (support/candidate-basis.mjs). By
// default it is derived from the fresh pack itself: this lane then proves the
// pack is self-consistent and that a tampered or self-consistently substituted
// archive is refused. With ABI5_CANDIDATE_BASIS_SOURCE=committed it is the
// committed basis fixture: the lane then also proves the pack equals that
// separately recorded identity, the external check the cut runs after writing
// the basis. Both refusals are asserted in both modes.
test("R1 verifies exact packed bytes without a source import", async (context) => {
  const artifacts = join(root, "artifacts");
  await rm(artifacts, { force: true, recursive: true });
  await mkdir(artifacts, { recursive: true });

  const [packResult] = await packProduct(root, artifacts);
  assert.equal(typeof packResult.filename, "string");

  const artifactPath = join(artifacts, packResult.filename);
  const extractRoot = await mkdtemp(join(tmpdir(), "abi5-r1-"));
  context.after(async () => rm(extractRoot, { force: true, recursive: true }));
  await execFileAsync("tar", ["-xzf", artifactPath, "-C", extractRoot]);

  const productRoot = join(extractRoot, "package");
  const packageJson = JSON.parse(await readFile(join(productRoot, "package.json"), "utf8"));
  const productModulePath = join(productRoot, "build/code/src/product/index.js");
  const product = await import(`${pathToFileURL(productModulePath).href}?artifact=${Date.now()}`);
  const candidateBasis = await expectedCandidateBasis(root, { artifactPath, productRoot, product });
  context.diagnostic(`candidate basis source: ${candidateBasisSource()}`);

  const request = {
    artifactPath,
    artifactRef: basename(artifactPath),
    ...expectedVerificationIdentity(candidateBasis),
  };
  const verified = await product.verifyProduct(request);
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));
  assert.equal(verified.kind, "verified_product_artifact");
  assert.equal(verified.checkedPayloadFiles > 0, true);
  // RC3 Increment B: the packed cut carries the fixed governed-context client,
  // the pinned adapter and the exact selected released GC03/Python contract.
  const packedManifest = JSON.parse(await readFile(join(productRoot, "product-toolchain-manifest.json"), "utf8"));
  const governedMembers = ["build/code/src/abg/governed_context_client.js", "contracts/governed-context/host_adapter.py", "contracts/governed-context/selection.json"];
  for (const path of governedMembers) assert.ok(packedManifest.productRelativeLocators.includes(path), path);
  const governedSelection = JSON.parse(await readFile(join(productRoot, "contracts/governed-context/selection.json"), "utf8"));
  assert.equal(governedSelection.gc03.identity, "urn:a-c:development-supplement:governed-context:gc03-adb3d8ee:1");
  assert.equal(governedSelection.gc03.inventorySha256, "fc6befa45d62acd902665d545fc20f65dc3d435fa242a72aaa4e8986c080c003");
  assert.equal(governedSelection.sourceCheckoutFallback, false);
  assert.deepEqual(governedSelection.python.invocation, ["-I", "-S", "-B"]);
  assert.equal(product.sha256Bytes(await readFile(join(productRoot, governedSelection.adapter.path))), governedSelection.adapter.sha256);
  assert.equal(product.sha256Bytes(await readFile(join(productRoot, governedSelection.client.path))), governedSelection.client.sha256);
  assert.ok((await readFile(join(root, "code/support/governed-context/host_adapter.py"))).equals(await readFile(join(productRoot, governedSelection.adapter.path))),
    "the packaged adapter is the tracked adapter byte for byte");

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
  assert.equal(refused.code, "artifact_digest_mismatch");

  const manifestPath = join(productRoot, "product-toolchain-manifest.json");
  const forgedManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const forgedInventory = [];
  for (const path of [...forgedManifest.productRelativeLocators].sort()) {
    forgedInventory.push({
      path,
      sha256: product.sha256Bytes(await readFile(join(productRoot, path))),
    });
  }
  forgedManifest.productContentDigest = product.payloadInventoryDigest(forgedInventory);
  await writeFile(manifestPath, `${product.canonicalJson(forgedManifest)}\n`, "utf8");
  const selfConsistentArtifactPath = join(
    artifacts,
    "self-consistent-substitution-abiogenesis-typescript-tenant.tgz",
  );
  await execFileAsync("tar", ["-czf", selfConsistentArtifactPath, "-C", extractRoot, "package"]);
  const selfConsistentRefusal = await product.verifyProduct({
    ...request,
    artifactPath: selfConsistentArtifactPath,
    artifactRef: basename(selfConsistentArtifactPath),
  });
  assert.equal(selfConsistentRefusal.disposition, "refused");
  assert.equal(selfConsistentRefusal.code, "artifact_digest_mismatch");

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
          selfManifestRecomputed: true,
          expectedRefusal: "artifact_digest_mismatch",
          observedRefusal: selfConsistentRefusal.code,
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
});
