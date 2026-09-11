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
  productId: "product://parcel-summary.example/serial-branch@5.0.0",
  moduleRef: "module://parcel-summary.example/serial-branch@5",
  programRef: "program://parcel-summary.example/serial-branch@5",
  graphFunctionRef: "graph-function://parcel-summary.example/serial-branch@5",
  graphRef: "graph://parcel-summary.example/serial-branch@5",
  startRef: "start://parcel-summary.example/serial-branch@5",
  selectNodeRef: "node://parcel-summary.example/serial-branch/select-construction@5",
  constructNodeRef: "node://parcel-summary.example/serial-branch/construct@5",
  prepareNodeRef: "node://parcel-summary.example/serial-branch/prepare-commands@5",
  executeNodeRef: "node://parcel-summary.example/serial-branch/execute@5",
  selectArmRef: "arm://parcel-summary.example/serial-branch/select-construction@5",
  prepareArmRef: "arm://parcel-summary.example/serial-branch/prepare-commands@5",
  closureContractRef: "contract://parcel-summary.example/serial-branch/closure@5",
  descriptorRef: "descriptor://parcel-summary.example/serial-branch@5",
  contributionManifestRef: "contribution-manifest://parcel-summary.example/serial-branch@5",
  provenanceRef: "provenance://parcel-summary.example/serial-branch@5",
  catalogRef: "catalog://parcel-summary.example/serial-branch/public-contracts@5.0.0",
});

// Authored before any C1 candidate exists. These are user oracles, not runtime truth.
const SPECIFICATION = deepFreezeJson({
  "kind": "serial_parcel_summary_consumer_specification",
  "schemaVersion": "5.0.0",
  "outcome": "One generic start constructs a reusable parcel calculation module, then its importing CLI, through ABI C3 serial branches; the completed aggregate feeds retained-entry preparation and C2 commands.",
  "relativeCwd": "parcels",
  "allowedWriteTerritories": [
    {
      "pathKind": "subtree",
      "relativePath": "parcels/execution-evidence"
    }
  ],
  "moduleInterfaces": [
    {
      "relativePath": "parcels/calculate.mjs",
      "interface": "Named export summarizeParcels(entries) returns {lineCount,totalParcels,totalGrams}; pure synchronous calculation, no input mutation, no output or other side effects when imported or called."
    },
    {
      "relativePath": "parcels/report.mjs",
      "interface": "Node ES-module CLI reads one JSON array from process.argv[2], statically imports named summarizeParcels from ./calculate.mjs and calls it for its summary. Print JSON.stringify(summary) plus exactly one newline; no other stdout or stderr; exit 0 for the valid domain. Do not duplicate arithmetic in this module."
    }
  ],
  "branches": [
    {
      "branchRef": "branch://parcel-summary.example/serial/calculation@5",
      "dependsOn": [],
      "targetRelativePath": "parcels/calculate.mjs",
      "prompt": "Create parcels/calculate.mjs as the reusable calculation module.\nExport the named synchronous function summarizeParcels(entries). Return the calculated summary without mutating entries. Importing or calling this module must not print output or perform I/O.\nThe valid input is an array of entries with label (nonempty string), count (nonnegative safe integer), and gramsEach (nonnegative safe integer). All products and sums in the supported domain are safe integers.\nCompute lineCount as array length, totalParcels as the sum of count, and totalGrams as the sum of count * gramsEach. Empty input produces three zeroes; zero-count entries still count toward lineCount.\nThe summary has exactly these properties in this order: lineCount, totalParcels, totalGrams. Compute from supplied values, with no fixture-identity checks or constant sample answers.\nUse dependency-free Node.js ES modules and Node built-ins only. Do not install packages, use a network, launch child processes, or write files from the generated modules.\nReturn complete candidate bytes for only the declared target. Construction is tool-free: do not read files or execute commands or generated code."
    },
    {
      "branchRef": "branch://parcel-summary.example/serial/report@5",
      "dependsOn": [
        "branch://parcel-summary.example/serial/calculation@5"
      ],
      "targetRelativePath": "parcels/report.mjs",
      "prompt": "Create parcels/report.mjs as the parcel-summary CLI.\nIts declared predecessor parcels/calculate.mjs exports summarizeParcels(entries), a pure synchronous function returning the summary specified below. This fixed module interface is user-authored before generation.\nUse a static named import of summarizeParcels from ./calculate.mjs and call it with JSON.parse(process.argv[2]); do not copy the calculation into the CLI.\nWrite JSON.stringify(the returned summary) followed by exactly one newline to stdout; emit no other stdout or stderr and exit 0 for valid input.\nThe valid input is an array of entries with label (nonempty string), count (nonnegative safe integer), and gramsEach (nonnegative safe integer). All products and sums in the supported domain are safe integers.\nCompute lineCount as array length, totalParcels as the sum of count, and totalGrams as the sum of count * gramsEach. Empty input produces three zeroes; zero-count entries still count toward lineCount.\nThe summary has exactly these properties in this order: lineCount, totalParcels, totalGrams. Compute from supplied values, with no fixture-identity checks or constant sample answers.\nUse dependency-free Node.js ES modules and Node built-ins only. Do not install packages, use a network, launch child processes, or write files from the generated modules.\nReturn complete candidate bytes for only the declared target. Construction is tool-free: do not read files or execute commands or generated code."
    }
  ],
  "configurations": [
    {
      "id": "mixed-loads",
      "cases": [
        {
          "id": "books-and-cards",
          "input": [
            {
              "label": "books",
              "count": 3,
              "gramsEach": 240
            },
            {
              "label": "cards",
              "count": 2,
              "gramsEach": 35
            }
          ],
          "expected": {
            "lineCount": 2,
            "totalParcels": 5,
            "totalGrams": 790
          },
          "stdout": "{\"lineCount\":2,\"totalParcels\":5,\"totalGrams\":790}\n",
          "exitCode": 0
        },
        {
          "id": "kits-and-spares",
          "input": [
            {
              "label": "kits",
              "count": 4,
              "gramsEach": 125
            },
            {
              "label": "spares",
              "count": 6,
              "gramsEach": 18
            },
            {
              "label": "unused",
              "count": 0,
              "gramsEach": 999
            }
          ],
          "expected": {
            "lineCount": 3,
            "totalParcels": 10,
            "totalGrams": 608
          },
          "stdout": "{\"lineCount\":3,\"totalParcels\":10,\"totalGrams\":608}\n",
          "exitCode": 0
        }
      ]
    },
    {
      "id": "empty-and-single",
      "cases": [
        {
          "id": "empty",
          "input": [],
          "expected": {
            "lineCount": 0,
            "totalParcels": 0,
            "totalGrams": 0
          },
          "stdout": "{\"lineCount\":0,\"totalParcels\":0,\"totalGrams\":0}\n",
          "exitCode": 0
        },
        {
          "id": "single",
          "input": [
            {
              "label": "washers",
              "count": 7,
              "gramsEach": 45
            }
          ],
          "expected": {
            "lineCount": 1,
            "totalParcels": 7,
            "totalGrams": 315
          },
          "stdout": "{\"lineCount\":1,\"totalParcels\":7,\"totalGrams\":315}\n",
          "exitCode": 0
        }
      ]
    }
  ],
  "failureVariant": {
    "id": "failed-report-with-independent-suffix",
    "configurationId": "mixed-loads",
    "independentSuffix": {
      "branchRef": "branch://parcel-summary.example/serial/independent-format@5",
      "dependsOn": [],
      "targetRelativePath": "parcels/format-version.mjs",
      "prompt": "Create only parcels/format-version.mjs as a dependency-free ES module exporting the named constant parcelReportFormatVersion with integer value 1. It has no imports, output, I/O, or execution side effects. Return candidate bytes only; do not use tools or execute code."
    },
    "controlledCondition": "The later runtime proof injects a deterministic failure at branch B construction before any B C0 effect, after branch A has completed and folded back. The fixture selects no injection implementation and supplies no event, result, fault, or closure truth.",
    "expected": {
      "successfulPrefixBranchRefs": [
        "branch://parcel-summary.example/serial/calculation@5"
      ],
      "stoppingBranchRef": "branch://parcel-summary.example/serial/report@5",
      "stoppingOrdinal": 1,
      "unstartedBranchRefs": [
        "branch://parcel-summary.example/serial/independent-format@5"
      ],
      "independentUnstartedBranchRefs": [
        "branch://parcel-summary.example/serial/independent-format@5"
      ],
      "dependencyBlockedBranchRefs": [],
      "retainedSuccessTargetPaths": [
        "parcels/calculate.mjs"
      ],
      "unchangedTargetPaths": [
        "parcels/report.mjs",
        "parcels/format-version.mjs"
      ],
      "completeOutputVector": false,
      "aggregateReducerEntered": false,
      "flatAggregateResult": false,
      "aggregateSuccessfulClosure": false,
      "retentionPreparationSuccessorEntered": false,
      "c2Entered": false,
      "c2SourceBasis": false,
      "rootSuccessfulClosure": false,
      "truthRequirement": "Fresh replay preserves the admitted A prefix, first B diagnostic, and C as unstarted due to serial stop rather than dependency failure. No rollback or fabricated successor is implied."
    }
  }
});

export { SPECIFICATION as SERIAL_BRANCH_WORKSITE_SPECIFICATION };

function exactlyOne(values, label) {
  if (values.length !== 1) throw new TypeError(`serial-branch fixture requires one exact ${label}`);
  return values[0];
}

/**
 * Pure declaration construction plus local JSON-only packaging for the proof
 * harness. All native constructors and ABI declarations are explicitly supplied
 * from the selected installed Product; this file imports no ABI source module.
 * Calling this helper never starts the authored Program or its generated CLI.
 */
export async function prepareSerialBranchWorksiteProduct({
  scratch,
  product,
  gtl,
  abiArtifact,
  abiPublications,
}) {
  const preparation = product.WORKSITE_PREPARATION_IDS;
  const c1 = product.WORKSITE_CONSTRUCTION_IDS;
  const c2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
  const c3 = product.WORKSITE_BRANCH_CONSTRUCTION_IDS;
  if (
    !product.isVerifiedProductArtifact(abiArtifact) ||
    !Array.isArray(abiPublications) ||
    typeof preparation?.rootPredicateRef !== "string" ||
    typeof product.worksiteRetentionBinding !== "function" ||
    typeof product.constructWorksiteBranchCommandPreparationInput !== "function" ||
    typeof product.constructWorksiteBranchConstructionTask !== "function" ||
    c3?.moduleRef !== c1?.moduleRef ||
    !abiArtifact.compatibilityRefs.includes(COMPATIBILITY_REF)
  ) {
    throw new TypeError("serial-branch fixture requires the actual verified ABI preparation owner");
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
    ) throw new TypeError("serial-branch ABI publication differs from its verified owner");
  }
  const selectBinding = exactlyOne(c2Publication.implementationBindings.filter(
    (row) => row.bindingRef === preparation.selectBranchBindingRef,
  ), "selection binding");
  const prepareBinding = exactlyOne(c2Publication.implementationBindings.filter(
    (row) => row.bindingRef === preparation.prepareBranchBindingRef,
  ), "preparation binding");
  for (const [binding, inputRef, outputRef] of [
    [selectBinding, preparation.branchInputContractRef, c3.taskContractRef],
    [prepareBinding, preparation.branchBoundInputContractRef, c2.taskContractRef],
  ]) {
    if (binding.computeRegime !== "F_D" || binding.inputContractRef !== inputRef ||
      binding.outputContractRef !== outputRef || binding.packageName !== abiArtifact.packageName ||
      binding.packageVersion !== abiArtifact.packageVersion) {
      throw new TypeError("serial-branch preparation binding differs from its exact E/S/T seam");
    }
  }
  const c3GraphFunction = exactlyOne(c1Publication.graphFunctions.filter((row) => row.name === c3.graphFunctionRef), "C3 root GraphFunction");
  const c2GraphFunction = exactlyOne(c2Publication.graphFunctions.filter((row) => row.name === c2.graphFunctionRef), "C2 GraphFunction");
  for (const [graphFunction, inputRef, outputRef] of [
    [c3GraphFunction, c3.taskContractRef, c3.resultContractRef],
    [c2GraphFunction, c2.taskContractRef, c2.observationContractRef],
  ]) {
    if (graphFunction.inputs.length !== 1 || graphFunction.inputs[0] !== inputRef ||
      graphFunction.outputs.length !== 1 || graphFunction.outputs[0] !== outputRef) {
      throw new TypeError("serial-branch workflow preserves the declared child A/B pair");
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
  const providedContracts = [c3.taskContractRef, c3.resultContractRef, preparation.branchBoundInputContractRef, c2.taskContractRef, c2.observationContractRef];
  const rootGraphFunction = {
    kind: "graph_function",
    name: IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [preparation.branchInputContractRef],
      provides: providedContracts,
      carries: [preparation.branchInputContractRef, ...providedContracts],
    },
    inputs: [preparation.branchInputContractRef],
    outputs: [c2.observationContractRef],
    template: {
      kind: "inline_graph",
      graphRef: IDS.graphRef,
      startNodeRef: IDS.selectNodeRef,
      terminalNodeRefs: [IDS.executeNodeRef],
      nodes: [
        pureNode(IDS.selectNodeRef, IDS.selectArmRef, selectBinding, preparation.selectBranchPredicateRef, "select-construction"),
        workflowNode(IDS.constructNodeRef, c3GraphFunction),
        pureNode(IDS.prepareNodeRef, IDS.prepareArmRef, prepareBinding, preparation.prepareBranchPredicateRef, "prepare-commands"),
        workflowNode(IDS.executeNodeRef, c2GraphFunction),
      ],
      edges: [
        gtl.graphEdge({ fromNodeRef: IDS.selectNodeRef, toNodeRef: IDS.constructNodeRef }),
        gtl.graphEdge({ fromNodeRef: IDS.constructNodeRef, toNodeRef: IDS.prepareNodeRef, inputBinding: product.worksiteRetentionBinding(true) }),
        gtl.graphEdge({ fromNodeRef: IDS.prepareNodeRef, toNodeRef: IDS.executeNodeRef }),
      ],
      applications: [],
    },
    effects: [...new Set([...c3GraphFunction.effects, ...c2GraphFunction.effects])],
    declarations: {
      "abg.compute_regime": "mixed",
      "abg.closure_contract": IDS.closureContractRef,
      "abg.evidence_contract": c2.evidenceContractRef,
      "abg.judgment_contract": c2.judgmentContractRef,
      "abg.judgment_predicate": preparation.rootPredicateRef,
      "abg.transition_contract": c2.transitionContractRef,
    },
    tags: ["parcel-summary.example", "serial-branch-consumer"],
  };
  const program = {
    kind: "gtl_program",
    programRef: IDS.programRef,
    version: "5.0.0",
    moduleRef: IDS.moduleRef,
    starts: [{ startRef: IDS.startRef, graphFunctionRef: IDS.graphFunctionRef }],
    callableMembership: [
      IDS.graphFunctionRef,
      c3.graphFunctionRef,
      c3.branchApplicationGraphFunctionRef,
      c3.reducerGraphFunctionRef,
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

  const packageName = "@parcel-summary.example/serial-branch-product";
  const packageVersion = "5.0.0";
  const catalogSchemaPath = "contracts/public-contract-catalog.schema.json";
  const specificationPath = "contracts/parcel-summary-specification.json";
  await mkdir(scratch, { recursive: true });
  const sourceRoot = await mkdtemp(join(scratch, "serial-branch-worksite-product-"));
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
    [catalogSchemaPath]: { $schema: "https://json-schema.org/draft/2020-12/schema", $id: "https://parcel-summary.example/contracts/public-contract-catalog@5", type: "object" },
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
    descriptorRef: IDS.descriptorRef, publisherNamespace: "parcel-summary.example",
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
      if (product.sha256Bytes(bytes) !== expected.sha256) throw new TypeError("installed serial-branch publication differs from packed payload");
      return materializePublication(basis, JSON.parse(bytes.toString("utf8")), installedGtl);
    },
    async loadInstalledSpecification({ installedRoot }) {
      const bytes = await readFile(join(installedRoot, specificationPath));
      const expected = payloadInventory.find((row) => row.path === specificationPath);
      if (product.sha256Bytes(bytes) !== expected.sha256) throw new TypeError("installed parcel-summary oracle differs from packed payload");
      return JSON.parse(bytes.toString("utf8"));
    },
    constructInput({ configurationId, variantId, workspaceAuthorityBasis, workspaceBinding, capabilityGrant, targets, nodeExecutable }) {
      const configuration = exactlyOne(SPECIFICATION.configurations.filter((row) => row.id === configurationId), "explicit parcel configuration");
      if (!["success", SPECIFICATION.failureVariant.id].includes(variantId)) {
        throw new TypeError("serial-branch input requires an explicit success or failure-oracle variant");
      }
      const branches = variantId === "success" ? SPECIFICATION.branches : [...SPECIFICATION.branches, SPECIFICATION.failureVariant.independentSuffix];
      if (!Array.isArray(targets) || targets.length !== branches.length ||
        targets.some((target, ordinal) => target?.subject?.relativePath !== branches[ordinal].targetRelativePath) ||
        typeof nodeExecutable !== "string" || !isAbsolute(nodeExecutable) ||
        capabilityGrant?.definitionKey?.operationId !== "abg.operation.run.invoke" ||
        capabilityGrant.definitionKey.memberKey !== "start" ||
        (variantId !== "success" && configurationId !== SPECIFICATION.failureVariant.configurationId)) {
        throw new TypeError("serial-branch input requires exact ordered targets, explicit Node executable and actual start grant");
      }
      // Commands are authored before start; only ABI C2 may execute them.
      const checks = configuration.cases.flatMap((row) => [
        { row, surface: "cli", args: ["report.mjs", JSON.stringify(row.input)] },
        { row, surface: "module", args: ["--input-type=module", "-e",
          "import { summarizeParcels } from './calculate.mjs'; const entries = JSON.parse(process.argv[1]); const before = JSON.stringify(entries); const summary = summarizeParcels(entries); if (JSON.stringify(entries) !== before) throw new Error('input mutated'); process.stdout.write(JSON.stringify(summary) + '\\n');",
          JSON.stringify(row.input)] },
      ]);
      const commands = checks.map(({ row, surface, args }) => ({
        commandId: `command://parcel-summary.example/${configuration.id}/${row.id}/${surface}@5`,
        executable: nodeExecutable, args, relativeCwd: SPECIFICATION.relativeCwd,
        environment: [{ kind: "worksite_command_environment_entry", schemaVersion: "5.0.0", name: "PATH", value: "/usr/bin:/bin" }],
        timeoutMs: 10000, terminationGraceMs: 1000, expectedReports: [],
      }));
      const outcomePredicates = checks.flatMap(({ row, surface }, index) => [
        { predicateId: `predicate://parcel-summary.example/${configuration.id}/${row.id}/${surface}/exit@5`, predicateKind: "process_exit", declaration: { validationCommandId: commands[index].commandId, equals: row.exitCode } },
        { predicateId: `predicate://parcel-summary.example/${configuration.id}/${row.id}/${surface}/stdout@5`, predicateKind: "stdout_exact", declaration: { validationCommandId: commands[index].commandId, equals: row.stdout } },
      ]);
      const constructionTask = product.constructWorksiteBranchConstructionTask({
        workspaceBinding, capabilityGrant,
        branches: branches.map((branch, ordinal) => ({
          branchRef: branch.branchRef, dependsOn: structuredClone(branch.dependsOn),
          constructionTask: product.constructWorksiteConstructionTask({
            workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
            prompt: branch.prompt, targets: [targets[ordinal]],
          }),
        })),
      });
      const input = product.constructWorksiteBranchCommandPreparationInput({
        constructionTask, commands, outcomePredicates,
        allowedWriteTerritories: structuredClone(SPECIFICATION.allowedWriteTerritories),
      });
      return { input, oracle: configuration, failureOracle: variantId === "success" ? null : SPECIFICATION.failureVariant,
        commands, outcomePredicates };
    },
  };
}
