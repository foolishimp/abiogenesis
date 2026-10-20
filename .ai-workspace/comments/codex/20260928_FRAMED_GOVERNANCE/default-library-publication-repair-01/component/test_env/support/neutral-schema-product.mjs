import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const SCHEMA_DIALECT = "https://json-schema.org/draft/2020-12/schema";
const COMPATIBILITY_REF = "compatibility://abiogenesis/major/5";

function deepFreezeJson(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreezeJson(child);
  return Object.freeze(value);
}

/**
 * Prepare author-owned JSON declarations for the installed proof harness.
 * product, gtl, abiPublication and abiArtifact must come from the explicitly
 * selected installed ABI artifact. This helper constructs no grant, receipt,
 * application, verified Product, install, binding or runtime event.
 */
export async function prepareNeutralSchemaProduct({
  scratch,
  product,
  gtl,
  abiPublication,
  abiArtifact,
}) {
  if (
    !product.isVerifiedProductArtifact(abiArtifact) ||
    abiPublication.owningProductId !== abiArtifact.productId ||
    abiPublication.artifactDigest !== abiArtifact.artifactDigest ||
    abiPublication.productContentDigest !== abiArtifact.productContentDigest ||
    abiPublication.productManifestDigest !== abiArtifact.manifestDigest ||
    abiPublication.productSemanticsBinding.packageName !== abiArtifact.packageName ||
    abiPublication.productSemanticsBinding.packageVersion !== abiArtifact.packageVersion ||
    !abiArtifact.compatibilityRefs.includes(COMPATIBILITY_REF)
  ) {
    throw new TypeError("neutral schema fixture requires one exact verified ABI owner");
  }
  const ownerPublications = abiArtifact.contributionManifest.publicationBindings.filter(
    (binding) => binding.moduleRef === abiPublication.moduleRef,
  );
  if (
    ownerPublications.length !== 1 ||
    ownerPublications[0].publicationDigest !== product.modulePublicationSemanticDigest(abiPublication)
  ) {
    throw new TypeError("ABI Hello publication differs from the verified owner manifest");
  }

  const ids = deepFreezeJson({
    productId: "product://neutral-schema.example/annotation@5.0.0",
    moduleRef: "module://neutral-schema.example/annotation@5",
    programRef: "program://neutral-schema.example/annotation@5",
    graphFunctionRef: "graph-function://neutral-schema.example/annotation@5",
    graphRef: "graph://neutral-schema.example/annotation@5",
    nodeRef: "node://neutral-schema.example/annotation/render@5",
    startRef: "start://neutral-schema.example/annotation@5",
    armRef: "arm://neutral-schema.example/annotation/render@5",
    descriptorRef: "descriptor://neutral-schema.example/annotation@5",
    contributionManifestRef: "contribution-manifest://neutral-schema.example/annotation@5",
    provenanceRef: "provenance://neutral-schema.example/annotation@5",
    catalogRef: "catalog://neutral-schema.example/annotation/public-contracts@5.0.0",
    catalogSchemaRef: "https://neutral-schema.example/contracts/public-contract-catalog@5",
    nodeTypeHandle: "node-type://neutral-schema.example/annotation/record@5",
    nodeTypeContractRef: "https://neutral-schema.example/contracts/annotation-record@5",
    overlayHandle: "overlay://neutral-schema.example/annotation/composition@5",
    overlayContractRef: "https://neutral-schema.example/contracts/annotation-composition@5",
    interactionProgramRef: "program://neutral-schema.example/annotation/interaction-only@5",
    interactionGraphFunctionRef: "graph-function://neutral-schema.example/annotation/interaction-only@5",
    interactionGraphRef: "graph://neutral-schema.example/annotation/interaction-only@5",
    interactionNodeRef: "node://neutral-schema.example/annotation/interaction-only@5",
    interactionStartRef: "start://neutral-schema.example/annotation/interaction-only@5",
    interactionArmRef: "arm://neutral-schema.example/annotation/interaction-only@5",
    interactionActorCapabilityRef: "capability://neutral-schema.example/annotation/human-assurance@5",
  });
  const packageName = "@neutral-schema.example/annotation-product";
  const packageVersion = "5.0.0";
  const nodeValueKind = "neutral_schema_annotation_record";
  const overlayValueKind = "neutral_schema_annotation_composition";
  const sourceGraphFunctions = abiPublication.graphFunctions.filter(
    (candidate) => candidate.name === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  const sourcePrograms = abiPublication.programs.filter(
    (candidate) => candidate.programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  if (sourceGraphFunctions.length !== 1 || sourcePrograms.length !== 1) {
    throw new TypeError("neutral schema fixture requires unique ABI Hello declarations");
  }
  const [sourceGraphFunction] = sourceGraphFunctions;
  const [sourceProgram] = sourcePrograms;
  const sourceNode = sourceGraphFunction.template.nodes.find(
    (candidate) => candidate.nodeRef === sourceGraphFunction.template.startNodeRef,
  );
  const sourceLeaf = sourceNode?.term;
  if (
    sourceLeaf?.kind !== "c_of" || sourceLeaf.fibre !== "F_D" ||
    sourceLeaf.requirement.kind !== "executable_leaf_requirement" ||
    sourceGraphFunction.template.nodes.length !== 1 ||
    sourceGraphFunction.template.edges.length !== 0 ||
    !sourceProgram.callableMembership.includes(sourceGraphFunction.name)
  ) {
    throw new TypeError("neutral schema fixture requires the exact single ABI Hello C leaf");
  }
  const graphFunction = {
    ...structuredClone(sourceGraphFunction),
    name: ids.graphFunctionRef,
    template: {
      ...structuredClone(sourceGraphFunction.template),
      graphRef: ids.graphRef,
      startNodeRef: ids.nodeRef,
      terminalNodeRefs: [ids.nodeRef],
      nodes: [{
        nodeRef: ids.nodeRef,
        nodeKind: "c_locus",
        term: gtl.C.of({
          input: gtl.cCarrier(sourceLeaf.inputCarrierRef),
          output: gtl.cCarrier(sourceLeaf.outputCarrierRef),
          programLocusRef: ids.nodeRef,
          stageRole: sourceLeaf.stageRole,
          fibre: sourceLeaf.fibre,
          armId: ids.armRef,
          compositionRef: sourceLeaf.compositionRef,
          vectorIndex: sourceLeaf.vectorIndex,
          judgmentPredicateRef: sourceLeaf.judgmentPredicateRef,
          resultBearing: sourceLeaf.resultBearing,
          requirement: structuredClone(sourceLeaf.requirement),
        }),
      }],
      edges: [],
      applications: [],
    },
    tags: ["neutral-schema.example", "abi-owned-hello-leaf"],
  };
  const program = {
    ...structuredClone(sourceProgram),
    programRef: ids.programRef,
    moduleRef: ids.moduleRef,
    starts: [{ startRef: ids.startRef, graphFunctionRef: ids.graphFunctionRef }],
    callableMembership: [ids.graphFunctionRef],
    policies: {
      ...structuredClone(sourceProgram.policies),
      "abg.default_start_ref": ids.startRef,
    },
  };
  // This separately published declaration supplies an actual outside-main-
  // Program node and an F_H-only closure for pure empty-resolution checks.
  // No actor grant, human response, runtime continuation or success is supplied.
  const interactionGraphFunction = {
    ...structuredClone(sourceGraphFunction),
    name: ids.interactionGraphFunctionRef,
    template: {
      kind: "inline_graph",
      graphRef: ids.interactionGraphRef,
      startNodeRef: ids.interactionNodeRef,
      terminalNodeRefs: [ids.interactionNodeRef],
      nodes: [{
        nodeRef: ids.interactionNodeRef,
        nodeKind: "c_locus",
        term: gtl.C.of({
          input: gtl.cCarrier(sourceLeaf.inputCarrierRef),
          output: gtl.cCarrier(sourceLeaf.outputCarrierRef),
          programLocusRef: ids.interactionNodeRef,
          stageRole: sourceLeaf.stageRole,
          fibre: "F_H",
          armId: ids.interactionArmRef,
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: sourceLeaf.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "interaction_leaf_requirement",
            interactionKind: "human_assurance",
            actorCapabilityRef: ids.interactionActorCapabilityRef,
            requestContractRef: sourceLeaf.inputCarrierRef,
            responseContractRef: sourceLeaf.outputCarrierRef,
            continuationContractRef: gtl.HELLO_WORLD_IDS.transitionContractRef,
          },
        }),
      }],
      edges: [],
      applications: [],
    },
    effects: [],
    declarations: {
      ...structuredClone(sourceGraphFunction.declarations),
      "abg.compute_regime": "F_H",
    },
    tags: ["neutral-schema.example", "interaction-only-declaration"],
  };
  const interactionProgram = {
    ...structuredClone(sourceProgram),
    programRef: ids.interactionProgramRef,
    moduleRef: ids.moduleRef,
    starts: [{ startRef: ids.interactionStartRef, graphFunctionRef: ids.interactionGraphFunctionRef }],
    callableMembership: [ids.interactionGraphFunctionRef],
    policies: {
      ...structuredClone(sourceProgram.policies),
      "abg.compute_regime": "F_H",
      "abg.default_start_ref": ids.interactionStartRef,
    },
  };
  const contracts = [
    { contractRef: ids.nodeTypeContractRef, contractVersion: "5.0.0", contractKind: "input", valueKind: nodeValueKind },
    { contractRef: ids.overlayContractRef, contractVersion: "5.0.0", contractKind: "input", valueKind: overlayValueKind },
  ];
  const publicationData = deepFreezeJson({
    moduleRef: ids.moduleRef,
    owningProductId: ids.productId,
    descriptorRef: ids.descriptorRef,
    contributionManifestRef: ids.contributionManifestRef,
    productSemanticsBinding: structuredClone(abiPublication.productSemanticsBinding),
    contracts,
    evaluators: [],
    rules: [],
    implementationBindings: [],
    closureContracts: [],
    programs: [program, interactionProgram],
    graphFunctions: [graphFunction, interactionGraphFunction],
    contributions: [
      [ids.graphFunctionRef, "graph_function", ids.graphFunctionRef, ids.programRef],
      [ids.nodeTypeHandle, "node_type", ids.nodeTypeContractRef, ids.programRef],
      [ids.overlayHandle, "overlay", ids.overlayContractRef, ids.programRef],
      [ids.interactionGraphFunctionRef, "graph_function", ids.interactionGraphFunctionRef, ids.interactionProgramRef],
    ].map(([handle, kind, declarationOrContractRef, memberProgramRef]) => ({
      handle,
      kind,
      declarationOrContractRef,
      owningProductId: ids.productId,
      programMembershipRefs: kind === "node_type" ? [] : [memberProgramRef],
      readinessPrerequisiteRefs: kind === "graph_function"
        ? [memberProgramRef]
        : [memberProgramRef, declarationOrContractRef],
      compatibilityRefs: [COMPATIBILITY_REF],
    })),
  });
  const schemas = deepFreezeJson({
    nodeType: {
      $schema: SCHEMA_DIALECT,
      $id: ids.nodeTypeContractRef,
      type: "object",
      additionalProperties: false,
      required: ["kind", "label", "weight", "annotationUri", "tags"],
      properties: {
        kind: { const: nodeValueKind },
        label: { type: "string", minLength: 1, maxLength: 80 },
        weight: { type: "integer", minimum: 0, maximum: 100 },
        annotationUri: { $ref: "#/$defs/absoluteUri" },
        tags: { type: "array", minItems: 1, uniqueItems: true, items: { type: "string", minLength: 1 } },
      },
      $defs: { absoluteUri: { type: "string", format: "uri" } },
    },
    overlay: {
      $schema: SCHEMA_DIALECT,
      $id: ids.overlayContractRef,
      type: "object",
      additionalProperties: false,
      required: ["kind", "label", "programRef", "graphFunctionRefs", "nodeRefs", "nodeTypeRef", "startRef"],
      properties: {
        kind: { const: overlayValueKind },
        label: { type: "string", minLength: 1, maxLength: 80 },
        programRef: { type: "string", const: ids.programRef },
        graphFunctionRefs: { type: "array", minItems: 1, maxItems: 1, items: { type: "string", const: ids.graphFunctionRef } },
        nodeRefs: { type: "array", minItems: 1, maxItems: 1, items: { type: "string", const: ids.nodeRef } },
        nodeTypeRef: { type: "string", const: ids.nodeTypeHandle },
        startRef: { type: "string", const: ids.startRef },
      },
    },
  });
  const validValues = deepFreezeJson({
    nodeType: [
      { kind: nodeValueKind, label: "Cedar", weight: 7, annotationUri: "urn:neutral-schema.example:annotation:cedar", tags: ["green", "quiet"] },
      { kind: nodeValueKind, label: "Quartz", weight: 23, annotationUri: "urn:neutral-schema.example:annotation:quartz", tags: ["clear"] },
    ],
    overlay: ["Cedar composition", "Quartz composition"].map((label) => ({
      kind: overlayValueKind,
      label,
      programRef: ids.programRef,
      graphFunctionRefs: [ids.graphFunctionRef],
      nodeRefs: [ids.nodeRef],
      nodeTypeRef: ids.nodeTypeHandle,
      startRef: ids.startRef,
    })),
  });
  const nodeValue = validValues.nodeType[0];
  const overlayValue = validValues.overlay[0];
  const { label: _label, ...missingLabel } = nodeValue;
  const invalidValues = deepFreezeJson({
    nodeType: [
      { name: "wrong_value_kind", value: { ...nodeValue, kind: overlayValueKind }, keyword: "const" },
      { name: "missing_required_label", value: missingLabel, keyword: "required" },
      { name: "uncoerced_weight", value: { ...nodeValue, weight: "7" }, keyword: "type" },
      { name: "weight_out_of_range", value: { ...nodeValue, weight: 101 }, keyword: "maximum" },
      { name: "relative_uri", value: { ...nodeValue, annotationUri: "relative/cedar" }, keyword: "format" },
      { name: "duplicate_tags", value: { ...nodeValue, tags: ["green", "green"] }, keyword: "uniqueItems" },
      { name: "undeclared_property", value: { ...nodeValue, extra: true }, keyword: "additionalProperties" },
    ],
    overlay: [
      { name: "wrong_program_membership", value: { ...overlayValue, programRef: ids.interactionProgramRef }, keyword: "const" },
      { name: "wrong_callable_membership", value: { ...overlayValue, graphFunctionRefs: [ids.interactionGraphFunctionRef] }, keyword: "const" },
      { name: "wrong_node_membership", value: { ...overlayValue, nodeRefs: [ids.interactionNodeRef] }, keyword: "const" },
      { name: "empty_callable_membership", value: { ...overlayValue, graphFunctionRefs: [] }, keyword: "minItems" },
    ],
  });

  // A fresh subdirectory avoids deleting any previous proof fixture.
  await mkdir(scratch, { recursive: true });
  const sourceRoot = await mkdtemp(join(scratch, "neutral-schema-product-"));
  await mkdir(join(sourceRoot, "build"));
  await mkdir(join(sourceRoot, "contracts/capabilities"), { recursive: true });
  const schemaPaths = {
    nodeType: "contracts/annotation-record.schema.json",
    overlay: "contracts/annotation-composition.schema.json",
  };
  const catalogSchemaPath = "contracts/public-contract-catalog.schema.json";
  const packageJson = {
    name: packageName,
    version: packageVersion,
    type: "module",
    exports: { "./publication": "./build/publication.json" },
    files: ["build", "contracts", "product-toolchain-manifest.json"],
  };
  const payload = {
    "package.json": packageJson,
    "build/publication.json": publicationData,
    [catalogSchemaPath]: { $schema: SCHEMA_DIALECT, $id: ids.catalogSchemaRef, type: "object" },
    [schemaPaths.nodeType]: schemas.nodeType,
    [schemaPaths.overlay]: schemas.overlay,
  };
  for (const [path, value] of Object.entries(payload)) {
    await writeFile(join(sourceRoot, path), `${product.canonicalJson(value)}\n`, "utf8");
  }
  // Data declarations own no executable capability. The fixed ABI graph
  // constructor produces the required empty graph; no ABI rows are copied.
  const capabilityDefinitionGraph = product.constructCapabilityDefinitionGraph([]);
  const capabilityGraphBytes = product.capabilityDefinitionGraphAssetBytes(capabilityDefinitionGraph);
  await writeFile(join(sourceRoot, product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH), capabilityGraphBytes);
  const graphCoordinate = product.capabilityDefinitionGraphCoordinate(capabilityDefinitionGraph);
  const productRelativeLocators = Object.keys(payload).sort();
  const payloadInventory = await Promise.all(productRelativeLocators.map(async (path) => ({
    path,
    sha256: await product.sha256File(join(sourceRoot, path)),
  })));
  const productContentDigest = product.payloadInventoryDigest(payloadInventory);
  const schemaAssets = await Promise.all(Object.entries(schemaPaths).map(async ([name, path]) => {
    const bytes = await readFile(join(sourceRoot, path));
    const contentDigest = product.sha256Bytes(bytes);
    return {
      name,
      productId: ids.productId,
      contractId: schemas[name].$id,
      assetLocator: { path, mediaType: "application/schema+json", schemaVersion: "5.0.0", contentDigest },
    };
  }));
  const catalogWithoutDigest = {
    schemaVersion: "5.0.0",
    catalogId: ids.catalogRef,
    catalogVersion: "5.0.0",
    catalogSchemaPath,
    catalogSchemaDigest: await product.sha256File(join(sourceRoot, catalogSchemaPath)),
    rows: schemaAssets.map((asset) => ({
      contractId: asset.contractId,
      contractVersion: "5.0.0",
      contractDigest: asset.assetLocator.contentDigest,
      contractKind: "schema_asset",
      owningProduct: ids.productId,
      requirementAuthorityRefs: [`requirement://neutral-schema.example/annotation/${asset.name}@5`],
      capabilityIdentities: [],
      assetLocator: asset.assetLocator,
    })),
  };
  const publicContractCatalog = {
    ...catalogWithoutDigest,
    catalogDigest: product.sha256Canonical(catalogWithoutDigest),
  };
  const materializePublication = (identity, data, installedGtl) => installedGtl.modulePublication({
    kind: "module_publication",
    moduleVersion: "5.0.0",
    ...structuredClone(data),
    artifactDigest: identity.artifactDigest,
    productContentDigest: identity.productContentDigest,
    productManifestDigest: identity.manifestDigest,
    contributions: data.contributions.map((contribution) => ({
      ...structuredClone(contribution),
      provenanceRefs: [identity.artifactDigest, identity.manifestDigest],
    })),
  });
  // The publication semantic digest excludes artifact/manifest digests and
  // contribution provenance. These placeholders are never verification truth.
  const placeholderDigest = `sha256:${"0".repeat(64)}`;
  const draftPublication = materializePublication({
    artifactDigest: placeholderDigest,
    productContentDigest,
    manifestDigest: placeholderDigest,
  }, publicationData, gtl);
  const contributionManifest = {
    kind: "product_contribution_manifest",
    schemaVersion: "5.0.0",
    contributionManifestRef: ids.contributionManifestRef,
    productId: ids.productId,
    productVersion: packageVersion,
    descriptorRef: ids.descriptorRef,
    productContentDigest,
    publicContractCatalogId: publicContractCatalog.catalogId,
    publicContractCatalogDigest: publicContractCatalog.catalogDigest,
    capabilityDefinitionGraph: graphCoordinate,
    publicationBindings: [{ moduleRef: ids.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(draftPublication) }],
    rows: draftPublication.contributions.map(({ provenanceRefs: _provenanceRefs, ...contribution }) => ({
      moduleRef: ids.moduleRef,
      ...structuredClone(contribution),
      provenanceRef: ids.provenanceRef,
    })),
  };
  const manifest = deepFreezeJson({
    kind: "abg_product_toolchain_manifest",
    schemaVersion: "5.0.0",
    productId: ids.productId,
    packageName,
    packageVersion,
    productContentDigest,
    productRelativeLocators,
    descriptorRef: ids.descriptorRef,
    publisherNamespace: "neutral-schema.example",
    contributionManifestRef: ids.contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest),
    contributionManifest,
    compatibilityRefs: [COMPATIBILITY_REF],
    declaredDependencies: [{
      kind: "requires",
      productId: abiArtifact.productId,
      packageVersion: abiArtifact.packageVersion,
      compatibilityRef: COMPATIBILITY_REF,
      requiredContractRefs: ["abg.contract.gtl.root-declaration", "abg.schema.public-operation-invocation"],
      requiredCapabilityRefs: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.gtl.declare@5"],
    }],
    provenanceRef: ids.provenanceRef,
    declaredCapabilityRefs: [],
    capabilityDefinitionGraph: {
      ...graphCoordinate,
      assetLocator: {
        path: product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
        mediaType: "application/json",
        schemaVersion: "5.0.0",
        contentDigest: product.sha256Bytes(capabilityGraphBytes),
      },
    },
    publicContractCatalog,
  });
  await writeFile(join(sourceRoot, "product-toolchain-manifest.json"), `${product.canonicalJson(manifest)}\n`, "utf8");
  const artifacts = join(sourceRoot, "artifacts");
  await mkdir(artifacts);
  const { stdout } = await execFileAsync("npm", [
    "pack", "--ignore-scripts", "--json", "--pack-destination", artifacts,
  ], { cwd: sourceRoot, maxBuffer: 10 * 1024 * 1024 });
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);
  const basis = deepFreezeJson({
    artifactDigest: await product.sha256File(artifactPath),
    manifestDigest: product.sha256Canonical(manifest),
    productContentDigest,
    productId: ids.productId,
    packageName,
    packageVersion,
  });
  return {
    artifactPath,
    artifactRef: basename(artifactPath),
    basis,
    ids,
    sourceRoot,
    manifest,
    contributionManifest: manifest.contributionManifest,
    descriptorSource: { descriptorRef: ids.descriptorRef, manifestPath: join(sourceRoot, "product-toolchain-manifest.json"), manifestDigest: basis.manifestDigest },
    publicationData,
    schemaAssets: deepFreezeJson(schemaAssets),
    validValues,
    invalidValues,
    membershipTargets: deepFreezeJson({
      nodeOutsideProgramRef: ids.interactionNodeRef,
      programOutsideContributionRef: ids.interactionProgramRef,
      missingNodeRef: "node://neutral-schema.example/annotation/absent@5",
      missingProgramRef: "program://neutral-schema.example/absent@5",
    }),
    semanticOwnerBasis: deepFreezeJson({
      productId: abiArtifact.productId,
      packageName: abiArtifact.packageName,
      packageVersion: abiArtifact.packageVersion,
      artifactDigest: abiArtifact.artifactDigest,
      productContentDigest: abiArtifact.productContentDigest,
      manifestDigest: abiArtifact.manifestDigest,
      inputContractRef: sourceLeaf.inputCarrierRef,
      outputContractRef: sourceLeaf.outputCarrierRef,
      implementationBindingRef: sourceLeaf.requirement.implementationBindingRef,
    }),
    async loadInstalledPublication({ installedRoot, gtl: installedGtl }) {
      const bytes = await readFile(join(installedRoot, "build/publication.json"));
      const expected = payloadInventory.find((row) => row.path === "build/publication.json");
      if (product.sha256Bytes(bytes) !== expected.sha256) {
        throw new TypeError("installed neutral publication differs from the packed payload");
      }
      return materializePublication(basis, JSON.parse(bytes.toString("utf8")), installedGtl);
    },
    async loadInstalledSchemaAssets({ installedRoot }) {
      return Promise.all(schemaAssets.map(async ({ productId, contractId, assetLocator }) => {
        const bytes = await readFile(join(installedRoot, assetLocator.path));
        if (product.sha256Bytes(bytes) !== assetLocator.contentDigest) {
          throw new TypeError(`installed neutral schema differs from its asset: ${contractId}`);
        }
        return { productId, contractId, bytesBase64: bytes.toString("base64") };
      }));
    },
  };
}
