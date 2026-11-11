import { readFile } from "node:fs/promises";
import { join } from "node:path";

function checkedCandidateBasis(value) {
  for (const key of [
    "artifactDigest",
    "manifestDigest",
    "productContentDigest",
  ]) {
    if (typeof value[key] !== "string" || !/^sha256:[a-f0-9]{64}$/u.test(value[key])) {
      throw new TypeError(`candidate basis ${key} is not one exact SHA-256 digest`);
    }
  }
  for (const key of ["productId", "packageName", "packageVersion"]) {
    if (typeof value[key] !== "string" || value[key].length === 0) {
      throw new TypeError(`candidate basis ${key} is not one exact non-empty identity`);
    }
  }
  return value;
}

export async function readCandidateBasis(packageRoot) {
  return checkedCandidateBasis(JSON.parse(
    await readFile(join(packageRoot, "test_env/fixtures/abi5-root-candidate-basis.json"), "utf8"),
  ));
}

// The expected identity of a freshly packed candidate has two sources, chosen
// by ABI5_CANDIDATE_BASIS_SOURCE. The default (unset or `packed_artifact`)
// derives it from the packed artifact itself: the archive's digest and the
// identity its packed manifest declares, as root-installed-environment.mjs
// does. That shows the pack is self-consistent; it does not show that the pack
// equals a separately recorded identity. `committed` reads the committed
// basis fixture, which scripts/refresh-candidate-basis.mjs writes: the
// external identity check the cut runs.
export function candidateBasisSource() {
  const source = process.env.ABI5_CANDIDATE_BASIS_SOURCE ?? "packed_artifact";
  if (source !== "packed_artifact" && source !== "committed") {
    throw new TypeError(`ABI5_CANDIDATE_BASIS_SOURCE must be packed_artifact or committed: ${source}`);
  }
  return source;
}

/** The expected identity of the packed artifact at `artifactPath`, extracted
 * at `productRoot`; `product` is that extracted package's product module. */
export async function expectedCandidateBasis(packageRoot, { artifactPath, productRoot, product }) {
  if (candidateBasisSource() === "committed") return readCandidateBasis(packageRoot);
  const manifest = JSON.parse(await readFile(join(productRoot, "product-toolchain-manifest.json"), "utf8"));
  return checkedCandidateBasis({
    kind: "abi5_root_candidate_basis",
    schemaVersion: "5.0.0",
    artifactDigest: await product.sha256File(artifactPath),
    productContentDigest: manifest.productContentDigest,
    manifestDigest: product.sha256Canonical(manifest),
    productId: manifest.productId,
    packageName: manifest.packageName,
    packageVersion: manifest.packageVersion,
  });
}

export function expectedVerificationIdentity(basis) {
  return {
    expectedArtifactDigest: basis.artifactDigest,
    expectedProductContentDigest: basis.productContentDigest,
    expectedManifestDigest: basis.manifestDigest,
    expectedProductId: basis.productId,
    expectedPackageName: basis.packageName,
    expectedPackageVersion: basis.packageVersion,
  };
}
