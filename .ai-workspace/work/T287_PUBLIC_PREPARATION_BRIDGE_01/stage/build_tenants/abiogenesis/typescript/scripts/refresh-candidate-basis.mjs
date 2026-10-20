import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = join(root, "artifacts");
const basisPath = join(
  root,
  "test_env/fixtures/abi5-root-candidate-basis.json",
);

await mkdir(artifacts, { recursive: true });
const { stdout } = await execFileAsync(
  "npm",
  ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
  { cwd: root, maxBuffer: 10 * 1024 * 1024 },
);
const [packed] = JSON.parse(stdout);
const archive = await readFile(join(artifacts, packed.filename));
const manifest = JSON.parse(
  await readFile(join(root, "product-toolchain-manifest.json"), "utf8"),
);
const { sha256Canonical } = await import(
  "../build/code/src/product/index.js"
);
const previous = JSON.parse(await readFile(basisPath, "utf8"));
const basis = {
  ...previous,
  artifactDigest: `sha256:${createHash("sha256").update(archive).digest("hex")}`,
  productContentDigest: manifest.productContentDigest,
  manifestDigest: sha256Canonical(manifest),
};

await writeFile(basisPath, `${JSON.stringify(basis, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(basis)}\n`);
