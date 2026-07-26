import { rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

await Promise.all([
  rm(resolve(root, "artifacts"), { force: true, recursive: true }),
  rm(resolve(root, "build"), { force: true, recursive: true }),
  rm(resolve(root, "contracts/schemas/consensus.schema.json"), { force: true }),
  rm(resolve(root, "contracts/vocabularies"), { force: true, recursive: true }),
  rm(resolve(root, "product-toolchain-manifest.json"), { force: true }),
  rm(resolve(root, "test_env/evidence"), { force: true, recursive: true }),
]);
