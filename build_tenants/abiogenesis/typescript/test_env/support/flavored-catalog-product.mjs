import { execFile } from "node:child_process";
import {
  cp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function prepareFlavoredCatalogProduct(packageRoot, scratch) {
  const fixtureRoot = join(
    packageRoot,
    "test_env/fixtures/flavored-catalog-product",
  );
  const sourceRoot = join(scratch, "flavored-catalog-product-source");
  await rm(sourceRoot, { force: true, recursive: true });
  await cp(fixtureRoot, sourceRoot, { recursive: true });
  await execFileAsync(
    join(packageRoot, "node_modules/.bin/tsc"),
    [
      "--project",
      join(sourceRoot, "tsconfig.json"),
      "--typeRoots",
      join(packageRoot, "node_modules/@types"),
    ],
    { cwd: sourceRoot, maxBuffer: 10 * 1024 * 1024 },
  );

  const product = await import(
    `${pathToFileURL(
      join(packageRoot, "build/code/src/product/index.js"),
    ).href}?flavored=${Date.now()}`
  );
  const packageJson = JSON.parse(
    await readFile(join(sourceRoot, "package.json"), "utf8"),
  );
  const productId = "product://flavor.example/text@5.0.0";
  const productRelativeLocators = [
    "build/index.d.ts",
    "build/index.js",
    "contracts/flavored-text.schema.json",
    "contracts/public-contract-catalog.schema.json",
    "package.json",
  ];
  const payloadInventory = await Promise.all(
    productRelativeLocators.map(async (path) => ({
      path,
      sha256: await product.sha256File(join(sourceRoot, path)),
    })),
  );
  const productContentDigest = product.payloadInventoryDigest(payloadInventory);
  const catalogSchemaPath =
    "contracts/public-contract-catalog.schema.json";
  const catalogSchemaDigest = await product.sha256File(
    join(sourceRoot, catalogSchemaPath),
  );
  const flavoredSchemaPath = "contracts/flavored-text.schema.json";
  const flavoredSchemaDigest = await product.sha256File(
    join(sourceRoot, flavoredSchemaPath),
  );
  const catalogWithoutDigest = {
    schemaVersion: "5.0.0",
    catalogId: "catalog://flavor.example/text/public-contracts@5.0.0",
    catalogVersion: "5.0.0",
    catalogSchemaPath,
    catalogSchemaDigest,
    rows: [{
      contractId: "flavor.example.contract.text",
      contractDigest: flavoredSchemaDigest,
      assetLocator: {
        path: flavoredSchemaPath,
        contentDigest: flavoredSchemaDigest,
      },
    }],
  };
  const manifest = {
    kind: "abg_product_toolchain_manifest",
    schemaVersion: "5.0.0",
    productId,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    productContentDigest,
    productRelativeLocators,
    publicContractCatalog: {
      ...catalogWithoutDigest,
      catalogDigest: product.sha256Canonical(catalogWithoutDigest),
    },
  };
  await writeFile(
    join(sourceRoot, "product-toolchain-manifest.json"),
    `${product.canonicalJson(manifest)}\n`,
    "utf8",
  );
  const manifestDigest = product.sha256Canonical(manifest);
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts, { recursive: true });
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: sourceRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);
  const artifactDigest = await product.sha256File(artifactPath);
  const module = await import(
    `${pathToFileURL(
      join(sourceRoot, "build/index.js"),
    ).href}?publication=${Date.now()}`
  );
  const basis = {
    artifactDigest,
    manifestDigest,
    productContentDigest,
    productId,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  };
  return {
    artifactPath,
    artifactRef: basename(artifactPath),
    basis,
    ids: module.FLAVORED_CATALOG_IDS,
    publication: module.constructFlavoredCatalogPublication({
      productId,
      artifactDigest,
      productContentDigest,
      productManifestDigest: manifestDigest,
      packageName: packageJson.name,
      packageVersion: packageJson.version,
    }),
    sourceRoot,
  };
}
