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
  const nativeDeclarationPath = "build/index.d.ts";
  const originalNativeDeclaration = await readFile(
    join(sourceRoot, nativeDeclarationPath),
  );
  if (options.transformDeclaration !== undefined) {
    await writeFile(
      join(sourceRoot, nativeDeclarationPath),
      options.transformDeclaration(
        new TextDecoder().decode(originalNativeDeclaration),
      ),
      "utf8",
    );
  }

  const product = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `flavored=${Date.now()}`,
  );
  const packageJson = JSON.parse(
    await readFile(join(sourceRoot, "package.json"), "utf8"),
  );
  const selfPackageSubpathDeclaration =
    options.addSelfPackageSubpath === true
      ? "build/shared.d.ts"
      : null;
  if (selfPackageSubpathDeclaration !== null) {
    await writeFile(
      join(sourceRoot, selfPackageSubpathDeclaration),
      "export interface SharedValue { readonly value: string; }\n",
      "utf8",
    );
    await writeFile(
      join(sourceRoot, nativeDeclarationPath),
      `${
        await readFile(join(sourceRoot, nativeDeclarationPath), "utf8")
      }\nexport type { SharedValue } from "${packageJson.name}/shared";\n`,
      "utf8",
    );
    packageJson.exports["./shared"] = {
      types: `./${selfPackageSubpathDeclaration}`,
    };
    await writeFile(
      join(sourceRoot, "package.json"),
      `${JSON.stringify(packageJson, null, 2)}\n`,
      "utf8",
    );
  }
  const module = await import(
    `${pathToFileURL(
      join(sourceRoot, "build/index.js"),
    ).href}?publication-authority=${Date.now()}`
  );
  const publicationModule = await import(
    `${pathToFileURL(
      join(sourceRoot, "build/publication.js"),
    ).href}?publication-authority=${Date.now()}`
  );
  const productId = "product://flavor.example/text@5.0.0";
  if (options.transformSchema !== undefined) {
    const schemaPath = join(
      sourceRoot,
      "contracts/flavored-text.schema.json",
    );
    const schema = JSON.parse(await readFile(schemaPath, "utf8"));
    await writeFile(
      schemaPath,
      `${JSON.stringify(options.transformSchema(schema), null, 2)}\n`,
      "utf8",
    );
  }
  const productRelativeLocators = [
    "build/index.d.ts",
    "build/index.js",
    "build/publication.d.ts",
    "build/publication.js",
    ...(selfPackageSubpathDeclaration === null
      ? []
      : [selfPackageSubpathDeclaration]),
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
  const nativeDeclarationPaths = [
    "build/index.d.ts",
    "build/publication.d.ts",
    ...(selfPackageSubpathDeclaration === null
      ? []
      : [selfPackageSubpathDeclaration]),
  ];
  const declarationInventory = await Promise.all(
    nativeDeclarationPaths.map(async (declarationPath) => ({
      packageExportPath: ".",
      declarationPath,
      declarationDigest: await product.sha256File(
        join(sourceRoot, declarationPath),
      ),
    })),
  );
  const nativeTypedLocator = {
    packageName: packageJson.name,
    packageExportPath: ".",
    namedSymbol: "FLAVORED_CATALOG_IDS",
    declarationPath: nativeDeclarationPath,
    declarationInventory,
  };
  const nativeContractDigest = product.sha256Canonical(
    nativeTypedLocator.declarationInventory,
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
  const nativeContractRows = [
    {
      contractId: "flavor.example.contract.native.ids",
      namedSymbol: "FLAVORED_CATALOG_IDS",
    },
    {
      contractId: "flavor.example.contract.native.publication",
      namedSymbol: "FlavoredDeclarationConstructors",
    },
  ].map(({ contractId, namedSymbol }) => ({
    contractId,
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest,
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "requirement://flavor.example/text/native-contract@5",
    ],
    capabilityIdentities: ["flavor.example.capability.native-contract@5"],
    nativeTypedLocator: {
      ...nativeTypedLocator,
      namedSymbol,
    },
  }));
  const catalogWithoutDigest = {
    schemaVersion: "5.0.0",
    catalogId: "catalog://flavor.example/text/public-contracts@5.0.0",
    catalogVersion: "5.0.0",
    catalogSchemaPath,
    catalogSchemaDigest,
    rows: [
      options.transformPublicContract === undefined
        ? publicContractRow
        : options.transformPublicContract(
          structuredClone(publicContractRow),
          { nativeContractDigest, nativeTypedLocator },
        ),
      ...nativeContractRows,
    ],
  };
  const publicContractCatalog = {
    ...catalogWithoutDigest,
    catalogDigest: product.sha256Canonical(catalogWithoutDigest),
  };
  const placeholderDigest = `sha256:${"0".repeat(64)}`;
  const constructPublication = (artifact) => {
    const publication = publicationModule.constructFlavoredCatalogPublication(
      artifact,
    );
    return options.transformPublication === undefined
      ? publication
      : options.transformPublication(structuredClone(publication));
  };
  const draftPublication = constructPublication({
    productId,
    artifactDigest: placeholderDigest,
    productContentDigest,
    productManifestDigest: placeholderDigest,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  });
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
    publicationBindings: [{
      moduleRef: draftPublication.moduleRef,
      publicationDigest:
        product.modulePublicationSemanticDigest(draftPublication),
    }],
    rows: draftPublication.contributions.map((contribution) => ({
      moduleRef: draftPublication.moduleRef,
      handle: contribution.handle,
      kind: contribution.kind,
      declarationOrContractRef: contribution.declarationOrContractRef,
      owningProductId: contribution.owningProductId,
      programMembershipRefs: [...contribution.programMembershipRefs],
      compatibilityRefs: [...contribution.compatibilityRefs],
      provenanceRef,
      readinessPrerequisiteRefs: [
        ...contribution.readinessPrerequisiteRefs,
      ],
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
        "abg.contract.product.verification",
        "abg.schema.public-operation-invocation",
      ],
      requiredCapabilityRefs: [
        "abg.capability.catalog.invoke-graph-function@5",
        "abg.capability.gtl.declare@5",
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
    publication: constructPublication({
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
