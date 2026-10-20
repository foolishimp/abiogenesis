import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function readCandidateBasis(packageRoot) {
  const value = JSON.parse(
    await readFile(join(packageRoot, "test_env/fixtures/abi5-root-candidate-basis.json"), "utf8"),
  );
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
