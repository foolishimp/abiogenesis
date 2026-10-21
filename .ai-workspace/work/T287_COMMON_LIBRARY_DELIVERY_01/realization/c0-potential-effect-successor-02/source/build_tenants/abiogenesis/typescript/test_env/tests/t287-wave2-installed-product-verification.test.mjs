import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  setupInstalledRootCatalog,
} from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("W2 Product verification detects stale bytes in an ABG-admitted install", async (context) => {
  const environment = await setupInstalledRootCatalog(context, root, {
    candidateBasisSource: "packed_artifact",
  });
  const {
    admittedInstall,
    artifactPath,
    product,
    verified,
  } = environment;

  assert.equal(admittedInstall.kind, "product_install");
  assert.equal(admittedInstall.disposition, "admitted");
  assert.match(admittedInstall.admissionEventRef, /\S/u);

  const packet = {
    kind: "product_verification_packet",
    schemaVersion: "5.0.0",
    memberKey: "verify",
    targetKind: "installed_artifact",
    installedProduct: admittedInstall,
    request: {
      artifactPath,
      artifactRef: basename(artifactPath),
      expectedArtifactDigest: verified.artifactDigest,
      expectedProductContentDigest: verified.productContentDigest,
      expectedManifestDigest: verified.manifestDigest,
      expectedProductId: verified.productId,
      expectedPackageName: verified.packageName,
      expectedPackageVersion: verified.packageVersion,
    },
  };

  const unchanged = await product.ProductVerificationPort.verify(packet);
  assert.equal(unchanged.kind, "product_verification_success");
  assert.equal(unchanged.disposition, "verified");
  assert.deepEqual(unchanged.verifiedArtifact, verified);

  const installedPayloadPath = join(
    admittedInstall.installedRoot,
    "build/code/src/product/verification_operation.js",
  );
  const installedPayload = await readFile(installedPayloadPath);
  const changedPayload = Buffer.from(installedPayload);
  changedPayload[0] ^= 1;
  await writeFile(installedPayloadPath, changedPayload);

  const stale = await product.ProductVerificationPort.verify(packet);
  assert.deepEqual(stale, {
    kind: "product_verification_installed_state_refusal",
    schemaVersion: "5.0.0",
    targetKind: "installed_artifact",
    disposition: "refused",
    code: "stale_installed_state",
    message: "the installed Product tree differs from its admitted content",
    installedProductRef: admittedInstall.installId,
  });
});
