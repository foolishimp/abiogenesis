import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { packProduct } from "./product-payload.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = join(root, "artifacts");
const basisPath = join(
  root,
  "test_env/fixtures/abi5-root-candidate-basis.json",
);

await mkdir(artifacts, { recursive: true });
const [packed] = await packProduct(root, artifacts);
const archive = await readFile(join(artifacts, packed.filename));
const manifest = JSON.parse(
  await readFile(join(root, "product-toolchain-manifest.json"), "utf8"),
);
const { sha256Canonical } = await import(
  "../build/code/src/product/index.js"
);
// The candidate's identity is the executing product's declared identity in its
// manifest; no member is carried over from a previous basis.
for (const key of ["productId", "packageName", "packageVersion"]) {
  if (typeof manifest[key] !== "string" || manifest[key].length === 0) {
    throw new TypeError(`product-toolchain-manifest.json declares no ${key}`);
  }
}
const basis = {
  kind: "abi5_root_candidate_basis",
  schemaVersion: "5.0.0",
  artifactDigest: `sha256:${createHash("sha256").update(archive).digest("hex")}`,
  productContentDigest: manifest.productContentDigest,
  manifestDigest: sha256Canonical(manifest),
  productId: manifest.productId,
  packageName: manifest.packageName,
  packageVersion: manifest.packageVersion,
};

await writeFile(basisPath, `${JSON.stringify(basis, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(basis)}\n`);
