import { execFile } from "node:child_process";
import {
  cp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import {
  importInstalledPackageExport,
} from "./root-cli-environment.mjs";

const execFileAsync = promisify(execFile);

export async function prepareFlavoredCatalogProduct(
  harness,
  scratch = harness.scratch,
  options = {},
) {
  const packageRoot = harness.sourcePackageRoot;
  const fixtureRoot = join(
    packageRoot,
    "test_env/fixtures/flavored-catalog-product",
  );
  const sourceRoot = join(scratch, "flavored-catalog-product-source");
  await rm(sourceRoot, { force: true, recursive: true });
  await cp(fixtureRoot, sourceRoot, { recursive: true });
  const installedTypeScope = join(
    sourceRoot,
    "node_modules",
    "@abiogenesis",
  );
  await mkdir(installedTypeScope, { recursive: true });
  await symlink(
    harness.installedPackageRoot,
    join(installedTypeScope, "typescript-tenant"),
    "dir",
  );
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

  const product = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `flavored=${Date.now()}`,
  );
  const gtl = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/gtl",
    `flavored-gtl=${Date.now()}`,
  );
  const packageJson = JSON.parse(
    await readFile(join(sourceRoot, "package.json"), "utf8"),
  );
  const module = await import(
    `${pathToFileURL(
      join(sourceRoot, "build/index.js"),
    ).href}?publication-authority=${Date.now()}`
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
  const descriptorRef = "descriptor://flavor.example/text@5";
  const contributionManifestRef =
    "contribution-manifest://flavor.example/text@5";
  const provenanceRef = "provenance://flavor.example/text@5";
  const publicContractRow = {
    contractId: "flavor.example.contract.text",
    contractVersion: "5.0.0",
    contractDigest: flavoredSchemaDigest,
    contractKind: "schema_asset",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "requirement://flavor.example/text/render@5",
    ],
    capabilityIdentities: ["flavor.example.capability.render@5"],
    assetLocator: {
      path: flavoredSchemaPath,
      mediaType: "application/schema+json",
      schemaVersion: "5.0.0",
      contentDigest: flavoredSchemaDigest,
    },
  };
  const catalogWithoutDigest = {
    schemaVersion: "5.0.0",
    catalogId: "catalog://flavor.example/text/public-contracts@5.0.0",
    catalogVersion: "5.0.0",
    catalogSchemaPath,
    catalogSchemaDigest,
    rows: [
      options.transformPublicContract === undefined
        ? publicContractRow
        : options.transformPublicContract(structuredClone(publicContractRow)),
    ],
  };
  const publicContractCatalog = {
    ...catalogWithoutDigest,
    catalogDigest: product.sha256Canonical(catalogWithoutDigest),
  };
  const placeholderDigest = `sha256:${"0".repeat(64)}`;
  const draftPublication = module.constructFlavoredCatalogPublication({
    productId,
    artifactDigest: placeholderDigest,
    productContentDigest,
    productManifestDigest: placeholderDigest,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  }, gtl);
  const contributionManifest = {
    kind: "product_contribution_manifest",
    schemaVersion: "5.0.0",
    contributionManifestRef,
    productId,
    productVersion: packageJson.version,
    descriptorRef,
    productContentDigest,
    publicContractCatalogId: publicContractCatalog.catalogId,
    publicContractCatalogDigest: publicContractCatalog.catalogDigest,
    rows: draftPublication.contributions.map((contribution) => ({
      moduleRef: draftPublication.moduleRef,
      handle: contribution.handle,
      kind: contribution.kind,
      declarationOrContractRef: contribution.declarationOrContractRef,
      owningProductId: contribution.owningProductId,
      programMembershipRefs: [...contribution.programMembershipRefs],
      compatibilityRefs: [...contribution.compatibilityRefs],
      provenanceRef,
      readinessPrerequisiteRefs: [...contribution.programMembershipRefs],
    })),
  };
  const manifest = {
    kind: "abg_product_toolchain_manifest",
    schemaVersion: "5.0.0",
    productId,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    productContentDigest,
    productRelativeLocators,
    descriptorRef,
    publisherNamespace: "flavor.example",
    contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest),
    contributionManifest,
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    declaredDependencies: [{
      kind: "requires",
      productId: harness.candidateBasis.productId,
      packageVersion: harness.candidateBasis.packageVersion,
      compatibilityRef: "compatibility://abiogenesis/major/5",
      requiredContractRefs: [
        "abg.contract.gtl.root-declaration",
        "abg.contract.public.root-invocation",
      ],
      requiredCapabilityRefs: [
        "abg.capability.catalog.invoke-graph-function@5",
        "abg.capability.gtl.author@5",
      ],
    }],
    provenanceRef,
    declaredCapabilityRefs: ["flavor.example.capability.render@5"],
    publicContractCatalog,
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
    nodeTypeValue: module.FLAVORED_NODE_TYPE,
    overlayValue: module.FLAVORED_PROGRAM_OVERLAY,
    publication: module.constructFlavoredCatalogPublication({
      productId,
      artifactDigest,
      productContentDigest,
      productManifestDigest: manifestDigest,
      packageName: packageJson.name,
      packageVersion: packageJson.version,
    }, gtl),
    sourceRoot,
  };
}
