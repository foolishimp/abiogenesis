import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  setupInstalledRootCatalog,
} from "../support/root-installed-environment.mjs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

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

// The verifier decompresses the artifact bytes it read once and walks their
// USTAR blocks once. Each archive below is refused at the code its stage owns:
// an archive the walk cannot read completely at the listing's code, a member
// the walk did not find at the code of the read that needs it.
function ustarHeader(path, size, typeflag = "0", { prefix = "", corrupt = false } = {}) {
  const block = Buffer.alloc(512);
  block.write(path, 0, 100, "utf8");
  block.write("0000644\0", 100, "ascii");
  block.write("0000000\0", 108, "ascii");
  block.write("0000000\0", 116, "ascii");
  block.write(`${size.toString(8).padStart(11, "0")}\0`, 124, "ascii");
  block.write("00000000000\0", 136, "ascii");
  block.write(typeflag, 156, "ascii");
  block.write("ustar\0", 257, "ascii");
  block.write("00", 263, "ascii");
  block.write(prefix, 345, 155, "utf8");
  block.fill(0x20, 148, 156);
  let checksum = 0;
  for (const byte of block) checksum += byte;
  block.write(`${checksum.toString(8).padStart(6, "0")}\0 `, 148, "ascii");
  if (corrupt) block[0] ^= 1;
  return block;
}

function ustarFile(path, text, options) {
  const body = Buffer.from(text);
  return Buffer.concat([
    ustarHeader(path, body.length, "0", options),
    body,
    Buffer.alloc((512 - (body.length % 512)) % 512),
  ]);
}

test("W2 Product verification walks the artifact bytes once and refuses an unreadable archive at its stage's code", async (context) => {
  const product = await import(pathToFileURL(join(root, "build/code/src/product/index.js")).href);
  const scratch = await mkdtemp(join(tmpdir(), "abi5-w2-archive-walk-"));
  context.after(() => rm(scratch, { recursive: true, force: true }));
  const manifest = "package/product-toolchain-manifest.json";
  const end = Buffer.alloc(1024);
  const tgz = (...members) => gzipSync(Buffer.concat([...members, end]));
  const cases = [
    ["not gzip", Buffer.from("changed archive bytes"), "artifact_unreadable", /Error/u],
    ["gzip of no tar", gzipSync(Buffer.from("x".repeat(2048))), "artifact_unreadable", /not a regular USTAR file or directory/u],
    ["truncated member", gzipSync(Buffer.concat([ustarHeader("package/a.txt", 4096), Buffer.alloc(512)])), "artifact_unreadable", /truncated: package\/a\.txt/u],
    ["no end-of-archive block", gzipSync(ustarFile("package/a.txt", "a")), "artifact_unreadable", /end-of-archive block/u],
    ["header checksum", tgz(ustarFile(manifest, "{}", { corrupt: true })), "artifact_unreadable", /not a regular USTAR file or directory/u],
    ["symbolic link member", tgz(ustarHeader("package/link", 0, "2"), ustarFile(manifest, "{}")), "artifact_unreadable", /not a regular USTAR file or directory/u],
    ["pax extended header", tgz(ustarHeader("PaxHeader/a", 0, "x"), ustarFile(manifest, "{}")), "artifact_unreadable", /not a regular USTAR file or directory/u],
    ["duplicated member", tgz(ustarFile(manifest, "{}"), ustarFile(manifest, "{}")), "artifact_unreadable", /not unique: package\/product-toolchain-manifest\.json/u],
    ["directory outside package/", tgz(ustarHeader("other/", 0, "5"), ustarFile(manifest, "{}")), "unsafe_locator", /outside package/u],
    ["member path with ..", tgz(ustarFile("package/../a.txt", "a"), ustarFile(manifest, "{}")), "unsafe_locator", /outside package/u],
    ["directories and no manifest member", tgz(ustarHeader("package/", 0, "5"), ustarHeader("package/build/", 0, "5"), ustarFile("package/build/a.js", "a")), "manifest_unreadable", /no regular file member package\/product-toolchain-manifest\.json/u],
    ["manifest member that is not JSON", tgz(ustarHeader("package/", 0, "5"), ustarFile(manifest, "not json")), "manifest_unreadable", /JSON/u],
    ["manifest path in the prefix field", tgz(ustarFile("product-toolchain-manifest.json", "not json", { prefix: "package" })), "manifest_unreadable", /JSON/u],
  ];
  for (const [label, bytes, code, reason] of cases) {
    const artifactPath = join(scratch, `${cases.findIndex((row) => row[0] === label)}.tgz`);
    await writeFile(artifactPath, bytes);
    const digest = product.sha256Bytes(bytes);
    const refused = await product.verifyProduct({
      artifactPath,
      artifactRef: `artifact://w2-archive-walk/${label}`,
      expectedArtifactDigest: digest,
      expectedProductContentDigest: digest,
      expectedManifestDigest: digest,
      expectedProductId: "product://w2-archive-walk",
      expectedPackageName: "w2-archive-walk",
      expectedPackageVersion: "0.0.0",
    });
    assert.equal(refused.kind, "product_verification_refusal", label);
    assert.equal(refused.code, code, `${label}: ${refused.message}`);
    assert.match(refused.message, reason, label);
  }
});
