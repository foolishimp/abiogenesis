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

function deepFreezeJson(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreezeJson(child);
  return Object.freeze(value);
}

export async function prepareOddGlcDataProduct({
  scratch,
  product,
  gtl,
  abiPublication,
}) {
  const productId = "product://odd-glc/hello@5.0.0";
  const packageName = "@abiogenesis-fixtures/odd-glc-data-product";
  const packageVersion = "5.0.0";
  const moduleRef = "module://odd-glc/hello@5";
  const programRef = "program://odd-glc/hello@5";
  const graphFunctionRef = "graph-function://odd-glc/hello@5";
  const graphRef = "graph://odd-glc/hello@5";
  const nodeRef = "node://odd-glc/hello/render@5";
  const startRef = "start://odd-glc/hello@5";
  const descriptorRef = "descriptor://odd-glc/hello@5";
  const contributionManifestRef =
    "contribution-manifest://odd-glc/hello@5";
  const provenanceRef = "provenance://odd-glc/hello@5";
  const sourceGraphFunction = abiPublication.graphFunctions.find(
    (candidate) => candidate.name === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  const sourceProgram = abiPublication.programs.find(
    (candidate) => candidate.programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  if (sourceGraphFunction === undefined || sourceProgram === undefined) {
    throw new TypeError("odd_glc data preparation requires ABI Hello declarations");
  }
  const sourceLeaf = sourceGraphFunction.template.nodes.find(
    (candidate) => candidate.nodeRef === sourceGraphFunction.template.startNodeRef,
  )?.term;
  if (sourceLeaf === undefined || sourceLeaf.kind !== "c_of") {
    throw new TypeError("odd_glc data preparation requires one ABI Hello C leaf");
  }
  const graphFunction = {
    ...structuredClone(sourceGraphFunction),
    name: graphFunctionRef,
    template: {
      ...structuredClone(sourceGraphFunction.template),
      graphRef,
      startNodeRef: nodeRef,
      terminalNodeRefs: [nodeRef],
      nodes: [{
        nodeRef,
        nodeKind: "c_locus",
        term: gtl.C.of({
          input: gtl.cCarrier(sourceLeaf.inputCarrierRef),
          output: gtl.cCarrier(sourceLeaf.outputCarrierRef),
          programLocusRef: nodeRef,
          stageRole: sourceLeaf.stageRole,
          fibre: sourceLeaf.fibre,
          armId: "arm://odd-glc/hello/abi-f-d@5",
          compositionRef: sourceLeaf.compositionRef,
          vectorIndex: sourceLeaf.vectorIndex,
          judgmentPredicateRef: sourceLeaf.judgmentPredicateRef,
          resultBearing: sourceLeaf.resultBearing,
          requirement: sourceLeaf.requirement,
        }),
      }],
      edges: [],
      applications: [],
    },
    tags: ["odd_glc", "abi-owned-f-d-hello"],
  };
  const program = {
    ...structuredClone(sourceProgram),
    programRef,
    moduleRef,
    starts: [{ startRef, graphFunctionRef }],
    callableMembership: [graphFunctionRef],
    policies: {
      ...structuredClone(sourceProgram.policies),
      "abg.default_start_ref": startRef,
    },
  };
  const publicationData = deepFreezeJson({
    moduleRef,
    owningProductId: productId,
    descriptorRef,
    contributionManifestRef,
    productSemanticsBinding: abiPublication.productSemanticsBinding,
    contracts: [],
    evaluators: [],
    rules: [],
    implementationBindings: [],
    closureContracts: [],
    programs: [program],
    graphFunctions: [graphFunction],
    contributions: [{
      handle: graphFunctionRef,
      kind: "graph_function",
      declarationOrContractRef: graphFunctionRef,
      owningProductId: productId,
      programMembershipRefs: [programRef],
      readinessPrerequisiteRefs: [programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    }],
  });
  const sourceRoot = join(scratch, "odd-glc-data-product-source");
  await rm(sourceRoot, { force: true, recursive: true });
  await mkdir(join(sourceRoot, "build"), { recursive: true });
  await mkdir(join(sourceRoot, "contracts/capabilities"), { recursive: true });
  const packageJson = {
    name: packageName,
    version: packageVersion,
    type: "module",
    exports: { "./publication": "./build/publication.json" },
    files: ["build", "contracts", "product-toolchain-manifest.json"],
  };
  const catalogSchema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
  };
  await writeFile(
    join(sourceRoot, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    join(sourceRoot, "build/publication.json"),
    `${product.canonicalJson(publicationData)}\n`,
    "utf8",
  );
  await writeFile(
    join(sourceRoot, "contracts/public-contract-catalog.schema.json"),
    `${product.canonicalJson(catalogSchema)}\n`,
    "utf8",
  );
  const capabilityDefinitionGraph =
    product.constructCapabilityDefinitionGraph([]);
  const capabilityDefinitionGraphBytes =
    product.capabilityDefinitionGraphAssetBytes(capabilityDefinitionGraph);
  await writeFile(
    join(sourceRoot, product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH),
    capabilityDefinitionGraphBytes,
  );
  const capabilityDefinitionGraphCoordinate =
    product.capabilityDefinitionGraphCoordinate(capabilityDefinitionGraph);
  const productRelativeLocators = [
    "contracts/public-contract-catalog.schema.json",
    "build/publication.json",
    "package.json",
  ];
  const payloadInventory = await Promise.all(
    productRelativeLocators.map(async (path) => ({
      path,
      sha256: await product.sha256File(join(sourceRoot, path)),
    })),
  );
  const productContentDigest = product.payloadInventoryDigest(payloadInventory);
  const placeholderDigest = `sha256:${"0".repeat(64)}`;
  const materializePublication = (
    identity,
    installedData = publicationData,
    gtlAuthority = gtl,
  ) =>
    gtlAuthority.modulePublication({
      kind: "module_publication",
      moduleVersion: "5.0.0",
      ...structuredClone(installedData),
      artifactDigest: identity.artifactDigest,
      productContentDigest: identity.productContentDigest,
      productManifestDigest: identity.manifestDigest,
      contributions: installedData.contributions.map((contribution) => ({
        ...structuredClone(contribution),
        provenanceRefs: [identity.artifactDigest, identity.manifestDigest],
      })),
    });
  const draftPublication = materializePublication({
    artifactDigest: placeholderDigest,
    productContentDigest,
    manifestDigest: placeholderDigest,
  });
  const catalogSchemaPath = "contracts/public-contract-catalog.schema.json";
  const catalogWithoutDigest = {
    schemaVersion: "5.0.0",
    catalogId: "catalog://odd-glc/public-contracts@5.0.0",
    catalogVersion: "5.0.0",
    catalogSchemaPath,
    catalogSchemaDigest: await product.sha256File(
      join(sourceRoot, catalogSchemaPath),
    ),
    rows: [],
  };
  const publicContractCatalog = {
    ...catalogWithoutDigest,
    catalogDigest: product.sha256Canonical(catalogWithoutDigest),
  };
  const contributionManifest = {
    kind: "product_contribution_manifest",
    schemaVersion: "5.0.0",
    contributionManifestRef,
    productId,
    productVersion: packageVersion,
    descriptorRef,
    productContentDigest,
    publicContractCatalogId: publicContractCatalog.catalogId,
    publicContractCatalogDigest: publicContractCatalog.catalogDigest,
    capabilityDefinitionGraph: capabilityDefinitionGraphCoordinate,
    publicationBindings: [{
      moduleRef,
      publicationDigest: product.modulePublicationSemanticDigest(
        draftPublication,
      ),
    }],
    rows: draftPublication.contributions.map((contribution) => ({
      moduleRef,
      handle: contribution.handle,
      kind: contribution.kind,
      declarationOrContractRef: contribution.declarationOrContractRef,
      owningProductId: contribution.owningProductId,
      programMembershipRefs: [...contribution.programMembershipRefs],
      compatibilityRefs: [...contribution.compatibilityRefs],
      provenanceRef,
      readinessPrerequisiteRefs: [...contribution.readinessPrerequisiteRefs],
    })),
  };
  const manifest = {
    kind: "abg_product_toolchain_manifest",
    schemaVersion: "5.0.0",
    productId,
    packageName,
    packageVersion,
    productContentDigest,
    productRelativeLocators,
    descriptorRef,
    publisherNamespace: "odd-glc",
    contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest),
    contributionManifest,
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    declaredDependencies: [{
      kind: "requires",
      productId: abiPublication.owningProductId,
      packageVersion: abiPublication.productSemanticsBinding.packageVersion,
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
    declaredCapabilityRefs: [],
    capabilityDefinitionGraph: {
      ...capabilityDefinitionGraphCoordinate,
      assetLocator: {
        path: product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
        mediaType: "application/json",
        schemaVersion: "5.0.0",
        contentDigest: product.sha256Bytes(capabilityDefinitionGraphBytes),
      },
    },
    publicContractCatalog,
  };
  await writeFile(
    join(sourceRoot, "product-toolchain-manifest.json"),
    `${product.canonicalJson(manifest)}\n`,
    "utf8",
  );
  const artifacts = join(scratch, "odd-glc-artifacts");
  await mkdir(artifacts, { recursive: true });
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: sourceRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);
  const basis = {
    artifactDigest: await product.sha256File(artifactPath),
    manifestDigest: product.sha256Canonical(manifest),
    productContentDigest,
    productId,
    packageName,
    packageVersion,
  };
  return {
    artifactPath,
    artifactRef: basename(artifactPath),
    basis,
    ids: { graphFunctionRef, moduleRef, nodeRef, programRef, startRef },
    sourceRoot,
    async loadInstalledPublication({ installedRoot, gtl: installedGtl }) {
      const installedData = JSON.parse(
        await readFile(join(installedRoot, "build/publication.json"), "utf8"),
      );
      return materializePublication(basis, installedData, installedGtl);
    },
  };
}

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
  const placeholderDigest = `sha256:${"0".repeat(64)}`;
  const draftPublication = module.constructDeveloperMiniPublication({
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
