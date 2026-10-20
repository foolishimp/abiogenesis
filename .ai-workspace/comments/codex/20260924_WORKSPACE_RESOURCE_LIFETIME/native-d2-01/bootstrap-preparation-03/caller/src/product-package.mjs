// Pure canonical ABI5 emitter extracted from the existing full-sandbox producer.
// There is no ordinary job input at this boundary.
export function constructOddGlcProductPackage({product,gtl,ids,abiArtifact,consumerPublication,
 sourceFiles={},contractRows=[],packageExports={"./publication":"./build/publication.json"}}) {
  const { kind: _kind, moduleVersion: _version, artifactDigest: _artifact,
    productContentDigest: _content, productManifestDigest: _manifest, ...publicationData } = structuredClone(consumerPublication);
  const schemaPath = "contracts/public-contract-catalog.schema.json";
  const values = {
    "package.json": { name: ids.packageName, version: ids.packageVersion, type: "module",
      exports: packageExports, files: ["build", "contracts", "product-toolchain-manifest.json"] },
    "build/publication.json": publicationData,
    [schemaPath]: { $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://odd-glc.example/contracts/generic-lifecycle-catalog@5", type: "object" },
  };
  const files = {...sourceFiles, ...Object.fromEntries(Object.entries(values).map(([path, value]) => [path, product.canonicalJson(value) + "\n"]))};
  const graph = product.constructCapabilityDefinitionGraph([]), graphBytes = product.capabilityDefinitionGraphAssetBytes(graph);
  const graphCoordinate = product.capabilityDefinitionGraphCoordinate(graph);
  files[product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH] = graphBytes;
  const productRelativeLocators = [...Object.keys(values),...Object.keys(sourceFiles)].sort();
  const payloadInventory = productRelativeLocators.map(path => ({ path, sha256: product.sha256Bytes(files[path]) }));
  const productContentDigest = product.payloadInventoryDigest(payloadInventory);
  const catalogBody = { schemaVersion: "5.0.0", catalogId: ids.catalogRef, catalogVersion: "5.0.0",
    catalogSchemaPath: schemaPath, catalogSchemaDigest: product.sha256Bytes(files[schemaPath]), rows: contractRows };
  const catalog = { ...catalogBody, catalogDigest: product.sha256Canonical(catalogBody) }, placeholder = "sha256:" + "0".repeat(64);
  const draft = gtl.modulePublication({kind:"module_publication",moduleVersion:"5.0.0",...publicationData,artifactDigest:placeholder,productContentDigest,productManifestDigest:placeholder});
  const contributionManifest = {
    kind: "product_contribution_manifest", schemaVersion: "5.0.0", contributionManifestRef: ids.contributionManifestRef,
    productId: ids.productId, productVersion: ids.packageVersion, descriptorRef: ids.descriptorRef, productContentDigest,
    publicContractCatalogId: catalog.catalogId, publicContractCatalogDigest: catalog.catalogDigest, capabilityDefinitionGraph: graphCoordinate,
    publicationBindings: [{ moduleRef: draft.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(draft) }],
    rows: draft.contributions.map(({ provenanceRefs: _refs, ...row }) => ({ moduleRef: draft.moduleRef, ...structuredClone(row), provenanceRef: ids.provenanceRef })),
  };
  const compatibilityRef = "compatibility://abiogenesis/major/5";
  const manifest = {
    kind: "abg_product_toolchain_manifest", schemaVersion: "5.0.0", productId: ids.productId,
    packageName: ids.packageName, packageVersion: ids.packageVersion, productContentDigest, productRelativeLocators,
    descriptorRef: ids.descriptorRef, publisherNamespace: "odd-glc", contributionManifestRef: ids.contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest), contributionManifest, compatibilityRefs: [compatibilityRef],
    declaredDependencies: [{ kind: "requires", productId: abiArtifact.productId, packageVersion: abiArtifact.packageVersion, compatibilityRef,
      requiredContractRefs: ["abg.contract.gtl.root-declaration", "abg.schema.public-operation-invocation"],
      requiredCapabilityRefs: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.gtl.declare@5"] }],
    provenanceRef: ids.provenanceRef, declaredCapabilityRefs: [],
    capabilityDefinitionGraph: { ...graphCoordinate, assetLocator: { path: product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
      mediaType: "application/json", schemaVersion: "5.0.0", contentDigest: product.sha256Bytes(graphBytes) } },
    publicContractCatalog: catalog,
  };
  files["product-toolchain-manifest.json"] = product.canonicalJson(manifest) + "\n";
  return { files, manifest, publicationData, payloadInventory, productContentDigest,
    bundle: { consumerPublication, lifecycle: consumerPublication.semanticJobLifecycle } };
}