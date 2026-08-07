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

export async function prepareDeveloperMiniProduct(packageRoot, scratch) {
  const fixtureRoot = join(
    packageRoot,
    "test_env/fixtures/developer-mini-product",
  );
  const sourceRoot = join(scratch, "developer-mini-product-source");
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
    `${pathToFileURL(join(packageRoot, "build/code/src/product/index.js")).href}?mini=${Date.now()}`
  );
  const packageJson = JSON.parse(
    await readFile(join(sourceRoot, "package.json"), "utf8"),
  );
  const module = await import(
    `${pathToFileURL(
      join(sourceRoot, "build/index.js"),
    ).href}?publication-authority=${Date.now()}`
  );
  const abiogenesisManifest = JSON.parse(
    await readFile(join(packageRoot, "product-toolchain-manifest.json"), "utf8"),
  );
  const productId = "product://developer.example/greeting@5.0.0";
  const productRelativeLocators = [
    "build/index.d.ts",
    "build/index.js",
    "contracts/greeting.schema.json",
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
  const catalogSchemaPath = "contracts/public-contract-catalog.schema.json";
  const catalogSchemaDigest = await product.sha256File(
    join(sourceRoot, catalogSchemaPath),
  );
  const greetingSchemaPath = "contracts/greeting.schema.json";
  const greetingSchemaDigest = await product.sha256File(
    join(sourceRoot, greetingSchemaPath),
  );
  const descriptorRef = "descriptor://developer.example/greeting@5";
  const contributionManifestRef =
    "contribution-manifest://developer.example/greeting@5";
  const provenanceRef = "provenance://developer.example/greeting@5";
  const catalogWithoutDigest = {
    schemaVersion: "5.0.0",
    catalogId: "catalog://developer.example/greeting/public-contracts@5.0.0",
    catalogVersion: "5.0.0",
    catalogSchemaPath,
    catalogSchemaDigest,
    rows: [{
      contractId: "developer.example.contract.greeting",
      contractVersion: "5.0.0",
      contractDigest: greetingSchemaDigest,
      contractKind: "schema_asset",
      owningProduct: productId,
      requirementAuthorityRefs: [
        "requirement://developer.example/greeting/render@5",
      ],
      capabilityIdentities: [
        "developer.example.capability.greeting@5",
      ],
      assetLocator: {
        path: greetingSchemaPath,
        mediaType: "application/schema+json",
        schemaVersion: "5.0.0",
        contentDigest: greetingSchemaDigest,
      },
    }],
  };
  const publicContractCatalog = {
    ...catalogWithoutDigest,
    catalogDigest: product.sha256Canonical(catalogWithoutDigest),
  };
  const placeholderArtifactDigest = `sha256:${"0".repeat(64)}`;
  const placeholderManifestDigest = `sha256:${"1".repeat(64)}`;
  const draftPublication = module.constructDeveloperMiniPublication({
    productId,
    artifactDigest: placeholderArtifactDigest,
    productContentDigest,
    productManifestDigest: placeholderManifestDigest,
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
    publisherNamespace: "developer.example",
    contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest),
    contributionManifest,
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    declaredDependencies: [{
      kind: "requires",
      productId: abiogenesisManifest.productId,
      packageVersion: abiogenesisManifest.packageVersion,
      compatibilityRef: "compatibility://abiogenesis/major/5",
      requiredContractRefs: [
        "abg.contract.gtl.root-declaration",
        "abg.schema.public-operation-invocation",
      ],
      requiredCapabilityRefs: [
        "abg.capability.catalog.invoke-graph-function@5",
        "abg.capability.gtl.declare@5",
      ],
    }],
    provenanceRef,
    declaredCapabilityRefs: ["developer.example.capability.greeting@5"],
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
  const publication = module.constructDeveloperMiniPublication({
    productId,
    artifactDigest,
    productContentDigest,
    productManifestDigest: manifestDigest,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  });
  const prepared = {
    artifactPath,
    artifactRef: basename(artifactPath),
    basis,
    ids: module.DEVELOPER_MINI_IDS,
    constructObservationSnapshot:
      module.constructDeveloperObservationSnapshot,
    publication,
    sourceRoot,
  };
  prepared.materializePublicationVariant = async (
    label,
    candidatePublication,
  ) => {
    if (
      product.modulePublicationSemanticDigest(candidatePublication) ===
        product.modulePublicationSemanticDigest(publication)
    ) {
      return prepared;
    }
    const safeLabel = label.replace(/[^a-zA-Z0-9._-]/gu, "-");
    const variantRoot = join(
      scratch,
      "developer-mini-product-variants",
      safeLabel,
    );
    await rm(variantRoot, { force: true, recursive: true });
    await mkdir(variantRoot, { recursive: true });
    await cp(sourceRoot, variantRoot, { recursive: true });
    const variantContributionManifest = {
      ...contributionManifest,
      publicationBindings: [{
        moduleRef: candidatePublication.moduleRef,
        publicationDigest:
          product.modulePublicationSemanticDigest(candidatePublication),
      }],
      rows: candidatePublication.contributions.map((contribution) => ({
        moduleRef: candidatePublication.moduleRef,
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
    const variantManifest = {
      ...manifest,
      contributionManifestDigest:
        product.sha256Canonical(variantContributionManifest),
      contributionManifest: variantContributionManifest,
    };
    await writeFile(
      join(variantRoot, "product-toolchain-manifest.json"),
      `${product.canonicalJson(variantManifest)}\n`,
      "utf8",
    );
    const variantManifestDigest = product.sha256Canonical(variantManifest);
    const variantArtifacts = join(
      scratch,
      "variant-artifacts",
      safeLabel,
    );
    await mkdir(variantArtifacts, { recursive: true });
    const { stdout: variantStdout } = await execFileAsync(
      "npm",
      [
        "pack",
        "--ignore-scripts",
        "--json",
        "--pack-destination",
        variantArtifacts,
      ],
      { cwd: variantRoot, maxBuffer: 10 * 1024 * 1024 },
    );
    const [variantPackResult] = JSON.parse(variantStdout);
    const variantArtifactPath = join(
      variantArtifacts,
      variantPackResult.filename,
    );
    const variantArtifactDigest =
      await product.sha256File(variantArtifactPath);
    const variantBasis = {
      ...basis,
      artifactDigest: variantArtifactDigest,
      manifestDigest: variantManifestDigest,
    };
    return {
      ...prepared,
      artifactPath: variantArtifactPath,
      artifactRef: basename(variantArtifactPath),
      basis: variantBasis,
      publication: {
        ...structuredClone(candidatePublication),
        artifactDigest: variantArtifactDigest,
        productContentDigest,
        productManifestDigest: variantManifestDigest,
        contributions: candidatePublication.contributions.map(
          (contribution) => ({
            ...structuredClone(contribution),
            provenanceRefs: [
              variantArtifactDigest,
              variantManifestDigest,
            ],
          }),
        ),
      },
      sourceRoot: variantRoot,
    };
  };
  return prepared;
}
