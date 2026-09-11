import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const COMPATIBILITY_REF = "compatibility://abiogenesis/major/5";

function deepFreezeJson(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreezeJson);
  return Object.freeze(value);
}

const IDS = deepFreezeJson({
  productId: "product://order-summary.example/single-start@5.0.0",
  moduleRef: "module://order-summary.example/single-start@5",
  programRef: "program://order-summary.example/single-start@5",
  graphFunctionRef: "graph-function://order-summary.example/single-start@5",
  graphRef: "graph://order-summary.example/single-start@5",
  startRef: "start://order-summary.example/single-start@5",
  selectNodeRef: "node://order-summary.example/single-start/select-construction@5",
  constructNodeRef: "node://order-summary.example/single-start/construct@5",
  prepareNodeRef: "node://order-summary.example/single-start/prepare-commands@5",
  executeNodeRef: "node://order-summary.example/single-start/execute@5",
  selectArmRef: "arm://order-summary.example/single-start/select-construction@5",
  prepareArmRef: "arm://order-summary.example/single-start/prepare-commands@5",
  closureContractRef: "contract://order-summary.example/single-start/closure@5",
  descriptorRef: "descriptor://order-summary.example/single-start@5",
  contributionManifestRef: "contribution-manifest://order-summary.example/single-start@5",
  provenanceRef: "provenance://order-summary.example/single-start@5",
  catalogRef: "catalog://order-summary.example/single-start/public-contracts@5.0.0",
});

// These inputs and expected outcomes are authored before C1 generates any code.
// Their arithmetic is a consumer oracle, never an admitted runtime result.
const SPECIFICATION = deepFreezeJson({
  kind: "order_summary_consumer_specification",
  schemaVersion: "5.0.0",
  targetRelativePath: "orders/summarize.mjs",
  relativeCwd: "orders",
  allowedWriteTerritories: [{ pathKind: "subtree", relativePath: "orders/execution-evidence" }],
  prompt: [
    "Create the complete dependency-free Node.js ES module orders/summarize.mjs.",
    "It is an order-summary CLI. Read exactly one JSON array from process.argv[2].",
    "Each valid item has name (nonempty string), quantity (nonnegative safe integer), and unitPriceCents (nonnegative safe integer).",
    "For the bounded valid domain, all products and sums are safe integers.",
    "Compute itemCount as the number of array entries, totalUnits as the sum of quantity, and totalCents as the sum of quantity * unitPriceCents.",
    "Print one compact JSON object in exactly this property order: itemCount, totalUnits, totalCents; append exactly one newline, emit no other stdout, and exit zero.",
    "An empty order must produce itemCount=0, totalUnits=0, totalCents=0.",
    "Compute from the supplied items; do not hardcode sample totals or branch on fixture identities.",
    "Use only Node.js built-ins, no package installation, network access, child processes, or filesystem writes from the generated CLI.",
    "Return candidate bytes for the one declared target under the existing construction result contract. Do not execute the generated code or tools.",
  ].join("\n"),
  configurations: [
    {
      id: "two-orders",
      cases: [
        {
          id: "market",
          input: [
            { name: "apples", quantity: 3, unitPriceCents: 125 },
            { name: "bread", quantity: 2, unitPriceCents: 350 },
          ],
          expected: { itemCount: 2, totalUnits: 5, totalCents: 1075 },
          stdout: '{"itemCount":2,"totalUnits":5,"totalCents":1075}\n',
          exitCode: 0,
        },
        {
          id: "office",
          input: [
            { name: "notebooks", quantity: 4, unitPriceCents: 275 },
            { name: "pens", quantity: 6, unitPriceCents: 80 },
          ],
          expected: { itemCount: 2, totalUnits: 10, totalCents: 1580 },
          stdout: '{"itemCount":2,"totalUnits":10,"totalCents":1580}\n',
          exitCode: 0,
        },
      ],
    },
    {
      id: "empty-and-single",
      cases: [
        { id: "empty", input: [], expected: { itemCount: 0, totalUnits: 0, totalCents: 0 }, stdout: '{"itemCount":0,"totalUnits":0,"totalCents":0}\n', exitCode: 0 },
        { id: "single", input: [{ name: "washers", quantity: 7, unitPriceCents: 45 }], expected: { itemCount: 1, totalUnits: 7, totalCents: 315 }, stdout: '{"itemCount":1,"totalUnits":7,"totalCents":315}\n', exitCode: 0 },
      ],
    },
  ],
});

export { SPECIFICATION as SINGLE_START_WORKSITE_SPECIFICATION };

function exactlyOne(values, label) {
  if (values.length !== 1) throw new TypeError(`single-start fixture requires one exact ${label}`);
  return values[0];
}

/**
 * Pure declaration construction plus local JSON-only packaging for the proof
 * harness. All native constructors and ABI declarations are explicitly supplied
 * from the selected installed Product; this file imports no ABI source module.
 * Calling this helper never starts the authored Program or its generated CLI.
 */
export async function prepareSingleStartWorksiteProduct({
  scratch,
  product,
  gtl,
  abiArtifact,
  abiPublications,
}) {
  const preparation = product.WORKSITE_PREPARATION_IDS;
  const c1 = product.WORKSITE_CONSTRUCTION_IDS;
  const c2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
  if (
    !product.isVerifiedProductArtifact(abiArtifact) ||
    !Array.isArray(abiPublications) ||
    typeof preparation?.rootPredicateRef !== "string" ||
    typeof product.worksiteRetentionBinding !== "function" ||
    typeof product.constructWorksiteCommandPreparationInput !== "function" ||
    !abiArtifact.compatibilityRefs.includes(COMPATIBILITY_REF)
  ) {
    throw new TypeError("single-start fixture requires the actual verified ABI preparation owner");
  }
  const c1Publication = exactlyOne(abiPublications.filter((row) => row.moduleRef === c1.moduleRef), "C1 publication");
  const c2Publication = exactlyOne(abiPublications.filter((row) => row.moduleRef === c2.moduleRef), "C2 publication");
  for (const publication of [c1Publication, c2Publication]) {
    const binding = exactlyOne(abiArtifact.contributionManifest.publicationBindings.filter(
      (row) => row.moduleRef === publication.moduleRef,
    ), "verified publication binding");
    if (
      publication.owningProductId !== abiArtifact.productId ||
      publication.artifactDigest !== abiArtifact.artifactDigest ||
      publication.productContentDigest !== abiArtifact.productContentDigest ||
      publication.productManifestDigest !== abiArtifact.manifestDigest ||
      publication.productSemanticsBinding.packageName !== abiArtifact.packageName ||
      publication.productSemanticsBinding.packageVersion !== abiArtifact.packageVersion ||
      binding.publicationDigest !== product.modulePublicationSemanticDigest(publication)
    ) throw new TypeError("single-start ABI publication differs from its verified owner");
  }
  const selectBinding = exactlyOne(c2Publication.implementationBindings.filter(
    (row) => row.bindingRef === preparation.selectBindingRef,
  ), "selection binding");
  const prepareBinding = exactlyOne(c2Publication.implementationBindings.filter(
    (row) => row.bindingRef === preparation.prepareBindingRef,
  ), "preparation binding");
  for (const [binding, inputRef, outputRef] of [
    [selectBinding, preparation.inputContractRef, c1.taskContractRef],
    [prepareBinding, preparation.boundInputContractRef, c2.taskContractRef],
  ]) {
    if (binding.computeRegime !== "F_D" || binding.inputContractRef !== inputRef ||
      binding.outputContractRef !== outputRef || binding.packageName !== abiArtifact.packageName ||
      binding.packageVersion !== abiArtifact.packageVersion) {
      throw new TypeError("single-start preparation binding differs from its exact E/S/T seam");
    }
  }
  const c1GraphFunction = exactlyOne(c1Publication.graphFunctions.filter((row) => row.name === c1.graphFunctionRef), "C1 root GraphFunction");
  const c2GraphFunction = exactlyOne(c2Publication.graphFunctions.filter((row) => row.name === c2.graphFunctionRef), "C2 GraphFunction");
  for (const [graphFunction, inputRef, outputRef] of [
    [c1GraphFunction, c1.taskContractRef, c1.resultContractRef],
    [c2GraphFunction, c2.taskContractRef, c2.observationContractRef],
  ]) {
    if (graphFunction.inputs.length !== 1 || graphFunction.inputs[0] !== inputRef ||
      graphFunction.outputs.length !== 1 || graphFunction.outputs[0] !== outputRef) {
      throw new TypeError("single-start workflow preserves the declared child A/B pair");
    }
  }
  const c2Close = exactlyOne(c2Publication.closureContracts.filter(
    (row) => row.closureContractRef === c2.closureContractRef,
  ), "C2 closure contract");
  const rootClose = gtl.closureContract({
    kind: "closure_contract",
    closureContractRef: IDS.closureContractRef,
    predicateRef: preparation.rootPredicateRef,
    evidenceContractRef: c2.evidenceContractRef,
    resultContractRef: c2.observationContractRef,
    refusalContractRef: c2.refusalContractRef,
    refusalValueKind: c2Close.refusalValueKind,
    judgmentContractRef: c2.judgmentContractRef,
    rejectionContractRef: c2.failureContractRef,
    transitionContractRef: c2.transitionContractRef,
    replayProjectionRef: c2Close.replayProjectionRef,
    terminalKind: "completed",
    closureScope: "run",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"],
  });
  const pureNode = (nodeRef, armId, binding, judgmentPredicateRef, stageRole) => ({
    nodeRef,
    nodeKind: "c_locus",
    term: gtl.C.of({
      input: gtl.cCarrier(binding.inputContractRef),
      output: gtl.cCarrier(binding.outputContractRef),
      programLocusRef: nodeRef,
      stageRole,
      fibre: "F_D",
      armId,
      compositionRef: null,
      vectorIndex: 0,
      judgmentPredicateRef,
      resultBearing: false,
      requirement: {
        kind: "executable_leaf_requirement",
        implementationBindingRef: binding.bindingRef,
        inputContractRef: binding.inputContractRef,
        outputContractRef: binding.outputContractRef,
        evidenceContractRef: c2.evidenceContractRef,
        failureContractRef: binding.failureContractRef,
        refusalContractRef: binding.refusalContractRef,
        judgmentContractRef: c2.judgmentContractRef,
      },
    }),
  });
  const workflowNode = (nodeRef, graphFunction) => ({
    nodeRef,
    nodeKind: "c_locus",
    term: gtl.workflow.C(gtl.cGraphFunctionRef({
      graphFunctionRef: graphFunction.name,
      input: gtl.cCarrier(graphFunction.inputs[0]),
      output: gtl.cCarrier(graphFunction.outputs[0]),
    })),
  });
  const providedContracts = [c1.taskContractRef, c1.resultContractRef, preparation.boundInputContractRef, c2.taskContractRef, c2.observationContractRef];
  const rootGraphFunction = {
    kind: "graph_function",
    name: IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [preparation.inputContractRef],
      provides: providedContracts,
      carries: [preparation.inputContractRef, ...providedContracts],
    },
    inputs: [preparation.inputContractRef],
    outputs: [c2.observationContractRef],
    template: {
      kind: "inline_graph",
      graphRef: IDS.graphRef,
      startNodeRef: IDS.selectNodeRef,
      terminalNodeRefs: [IDS.executeNodeRef],
      nodes: [
        pureNode(IDS.selectNodeRef, IDS.selectArmRef, selectBinding, preparation.selectPredicateRef, "select-construction"),
        workflowNode(IDS.constructNodeRef, c1GraphFunction),
        pureNode(IDS.prepareNodeRef, IDS.prepareArmRef, prepareBinding, preparation.preparePredicateRef, "prepare-commands"),
        workflowNode(IDS.executeNodeRef, c2GraphFunction),
      ],
      edges: [
        gtl.graphEdge({ fromNodeRef: IDS.selectNodeRef, toNodeRef: IDS.constructNodeRef }),
        gtl.graphEdge({ fromNodeRef: IDS.constructNodeRef, toNodeRef: IDS.prepareNodeRef, inputBinding: product.worksiteRetentionBinding() }),
        gtl.graphEdge({ fromNodeRef: IDS.prepareNodeRef, toNodeRef: IDS.executeNodeRef }),
      ],
      applications: [],
    },
    effects: [...new Set([...c1GraphFunction.effects, ...c2GraphFunction.effects])],
    declarations: {
      "abg.compute_regime": "mixed",
      "abg.closure_contract": IDS.closureContractRef,
      "abg.evidence_contract": c2.evidenceContractRef,
      "abg.judgment_contract": c2.judgmentContractRef,
      "abg.judgment_predicate": preparation.rootPredicateRef,
      "abg.transition_contract": c2.transitionContractRef,
    },
    tags: ["order-summary.example", "single-start-consumer"],
  };
  const program = {
    kind: "gtl_program",
    programRef: IDS.programRef,
    version: "5.0.0",
    moduleRef: IDS.moduleRef,
    starts: [{ startRef: IDS.startRef, graphFunctionRef: IDS.graphFunctionRef }],
    callableMembership: [
      IDS.graphFunctionRef,
      c1.graphFunctionRef,
      c1.vectorApplicationGraphFunctionRef,
      c1.fileReplaceGraphFunctionRef,
      c1.reducerGraphFunctionRef,
      c2.graphFunctionRef,
    ],
    closureContractRef: IDS.closureContractRef,
    policies: { "abg.root_mode": "direct", "abg.compute_regime": "mixed", "abg.default_start_ref": IDS.startRef },
  };
  const publicationData = deepFreezeJson({
    moduleRef: IDS.moduleRef,
    owningProductId: IDS.productId,
    descriptorRef: IDS.descriptorRef,
    contributionManifestRef: IDS.contributionManifestRef,
    productSemanticsBinding: structuredClone(c2Publication.productSemanticsBinding),
    contracts: [],
    evaluators: [],
    rules: [],
    implementationBindings: [],
    closureContracts: [rootClose],
    programs: [program],
    graphFunctions: [rootGraphFunction],
    contributions: [{
      handle: IDS.graphFunctionRef,
      kind: "graph_function",
      declarationOrContractRef: IDS.graphFunctionRef,
      owningProductId: IDS.productId,
      programMembershipRefs: [IDS.programRef],
      readinessPrerequisiteRefs: [IDS.programRef],
      compatibilityRefs: [COMPATIBILITY_REF],
    }],
  });

  const packageName = "@order-summary.example/single-start-product";
  const packageVersion = "5.0.0";
  const catalogSchemaPath = "contracts/public-contract-catalog.schema.json";
  const specificationPath = "contracts/order-summary-specification.json";
  await mkdir(scratch, { recursive: true });
  const sourceRoot = await mkdtemp(join(scratch, "single-start-worksite-product-"));
  await mkdir(join(sourceRoot, "build"));
  await mkdir(join(sourceRoot, "contracts/capabilities"), { recursive: true });
  const payload = {
    "package.json": {
      name: packageName,
      version: packageVersion,
      type: "module",
      exports: { "./publication": "./build/publication.json" },
      files: ["build", "contracts", "product-toolchain-manifest.json"],
    },
    "build/publication.json": publicationData,
    [specificationPath]: SPECIFICATION,
    [catalogSchemaPath]: { $schema: "https://json-schema.org/draft/2020-12/schema", $id: "https://order-summary.example/contracts/public-contract-catalog@5", type: "object" },
  };
  for (const [path, value] of Object.entries(payload)) {
    await writeFile(join(sourceRoot, path), `${product.canonicalJson(value)}\n`, "utf8");
  }
  const graph = product.constructCapabilityDefinitionGraph([]);
  const graphBytes = product.capabilityDefinitionGraphAssetBytes(graph);
  const graphCoordinate = product.capabilityDefinitionGraphCoordinate(graph);
  await writeFile(join(sourceRoot, product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH), graphBytes);
  const productRelativeLocators = Object.keys(payload).sort();
  const payloadInventory = await Promise.all(productRelativeLocators.map(async (path) => ({
    path, sha256: await product.sha256File(join(sourceRoot, path)),
  })));
  const productContentDigest = product.payloadInventoryDigest(payloadInventory);
  const catalogBody = {
    schemaVersion: "5.0.0", catalogId: IDS.catalogRef, catalogVersion: "5.0.0",
    catalogSchemaPath, catalogSchemaDigest: await product.sha256File(join(sourceRoot, catalogSchemaPath)), rows: [],
  };
  const catalog = { ...catalogBody, catalogDigest: product.sha256Canonical(catalogBody) };
  const materializePublication = (identity, data, installedGtl) => installedGtl.modulePublication({
    kind: "module_publication", moduleVersion: "5.0.0", ...structuredClone(data),
    artifactDigest: identity.artifactDigest, productContentDigest: identity.productContentDigest,
    productManifestDigest: identity.manifestDigest,
    contributions: data.contributions.map((row) => ({ ...structuredClone(row), provenanceRefs: [identity.artifactDigest, identity.manifestDigest] })),
  });
  // Artifact and manifest coordinates are excluded by the installed semantic
  // publication digest. Placeholders never represent verification or runtime truth.
  const placeholderDigest = `sha256:${"0".repeat(64)}`;
  const draft = materializePublication({ artifactDigest: placeholderDigest, productContentDigest, manifestDigest: placeholderDigest }, publicationData, gtl);
  const contributionManifest = {
    kind: "product_contribution_manifest", schemaVersion: "5.0.0",
    contributionManifestRef: IDS.contributionManifestRef, productId: IDS.productId,
    productVersion: packageVersion, descriptorRef: IDS.descriptorRef, productContentDigest,
    publicContractCatalogId: catalog.catalogId, publicContractCatalogDigest: catalog.catalogDigest,
    capabilityDefinitionGraph: graphCoordinate,
    publicationBindings: [{ moduleRef: IDS.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(draft) }],
    rows: draft.contributions.map(({ provenanceRefs: _provenanceRefs, ...row }) => ({ moduleRef: IDS.moduleRef, ...structuredClone(row), provenanceRef: IDS.provenanceRef })),
  };
  const manifest = deepFreezeJson({
    kind: "abg_product_toolchain_manifest", schemaVersion: "5.0.0",
    productId: IDS.productId, packageName, packageVersion, productContentDigest, productRelativeLocators,
    descriptorRef: IDS.descriptorRef, publisherNamespace: "order-summary.example",
    contributionManifestRef: IDS.contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest), contributionManifest,
    compatibilityRefs: [COMPATIBILITY_REF],
    declaredDependencies: [{
      kind: "requires", productId: abiArtifact.productId, packageVersion: abiArtifact.packageVersion,
      compatibilityRef: COMPATIBILITY_REF,
      requiredContractRefs: ["abg.contract.gtl.root-declaration", "abg.schema.public-operation-invocation"],
      requiredCapabilityRefs: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.gtl.declare@5"],
    }],
    provenanceRef: IDS.provenanceRef, declaredCapabilityRefs: [],
    capabilityDefinitionGraph: { ...graphCoordinate, assetLocator: {
      path: product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH, mediaType: "application/json", schemaVersion: "5.0.0", contentDigest: product.sha256Bytes(graphBytes),
    } },
    publicContractCatalog: catalog,
  });
  await writeFile(join(sourceRoot, "product-toolchain-manifest.json"), `${product.canonicalJson(manifest)}\n`, "utf8");
  const artifacts = join(sourceRoot, "artifacts");
  await mkdir(artifacts);
  const { stdout } = await execFileAsync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts], { cwd: sourceRoot, maxBuffer: 10 * 1024 * 1024 });
  const [packed] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packed.filename);
  const basis = deepFreezeJson({ artifactDigest: await product.sha256File(artifactPath), manifestDigest: product.sha256Canonical(manifest), productContentDigest, productId: IDS.productId, packageName, packageVersion });
  return {
    artifactPath, artifactRef: basename(artifactPath), basis, ids: IDS, sourceRoot,
    manifest, contributionManifest: manifest.contributionManifest, publicationData,
    specification: SPECIFICATION,
    descriptorSource: { descriptorRef: IDS.descriptorRef, manifestPath: join(sourceRoot, "product-toolchain-manifest.json"), manifestDigest: basis.manifestDigest },
    semanticOwnerBasis: deepFreezeJson({ productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest, productContentDigest: abiArtifact.productContentDigest, manifestDigest: abiArtifact.manifestDigest, moduleRefs: [c1Publication.moduleRef, c2Publication.moduleRef] }),
    async loadInstalledPublication({ installedRoot, gtl: installedGtl }) {
      const bytes = await readFile(join(installedRoot, "build/publication.json"));
      const expected = payloadInventory.find((row) => row.path === "build/publication.json");
      if (product.sha256Bytes(bytes) !== expected.sha256) throw new TypeError("installed single-start publication differs from packed payload");
      return materializePublication(basis, JSON.parse(bytes.toString("utf8")), installedGtl);
    },
    async loadInstalledSpecification({ installedRoot }) {
      const bytes = await readFile(join(installedRoot, specificationPath));
      const expected = payloadInventory.find((row) => row.path === specificationPath);
      if (product.sha256Bytes(bytes) !== expected.sha256) throw new TypeError("installed order-summary oracle differs from packed payload");
      return JSON.parse(bytes.toString("utf8"));
    },
    constructInput({ configurationId, workspaceAuthorityBasis, workspaceBinding, capabilityGrant, target, nodeExecutable }) {
      const configuration = exactlyOne(SPECIFICATION.configurations.filter((row) => row.id === configurationId), "explicit order-summary configuration");
      if (target?.subject?.relativePath !== SPECIFICATION.targetRelativePath ||
        typeof nodeExecutable !== "string" || !isAbsolute(nodeExecutable) ||
        capabilityGrant?.definitionKey?.operationId !== "abg.operation.run.invoke" ||
        capabilityGrant.definitionKey.memberKey !== "start") {
        throw new TypeError("single-start input requires its actual target, explicit Node executable and start grant");
      }
      const commands = configuration.cases.map((row) => ({
        commandId: `command://order-summary.example/${configuration.id}/${row.id}@5`,
        executable: nodeExecutable,
        args: [basename(SPECIFICATION.targetRelativePath), JSON.stringify(row.input)],
        relativeCwd: SPECIFICATION.relativeCwd,
        environment: [{ kind: "worksite_command_environment_entry", schemaVersion: "5.0.0", name: "PATH", value: "/usr/bin:/bin" }],
        timeoutMs: 10000, terminationGraceMs: 1000, expectedReports: [],
      }));
      const outcomePredicates = configuration.cases.flatMap((row, index) => [
        { predicateId: `predicate://order-summary.example/${configuration.id}/${row.id}/exit@5`, predicateKind: "process_exit", declaration: { validationCommandId: commands[index].commandId, equals: row.exitCode } },
        { predicateId: `predicate://order-summary.example/${configuration.id}/${row.id}/stdout@5`, predicateKind: "stdout_exact", declaration: { validationCommandId: commands[index].commandId, equals: row.stdout } },
      ]);
      const constructionTask = product.constructWorksiteConstructionTask({
        workspaceAuthorityBasis, workspaceBinding, capabilityGrant, prompt: SPECIFICATION.prompt, targets: [target],
      });
      const input = product.constructWorksiteCommandPreparationInput({ constructionTask, commands, outcomePredicates, allowedWriteTerritories: structuredClone(SPECIFICATION.allowedWriteTerritories) });
      return { input, oracle: configuration, commands, outcomePredicates };
    },
  };
}
