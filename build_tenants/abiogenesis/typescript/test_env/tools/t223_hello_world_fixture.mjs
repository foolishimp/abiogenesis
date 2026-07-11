// T-223 publisher fixture generator. The generated package is declarations-only.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  canonicalizeIJson,
  constructAbgFnCompositionDeclarations,
  constructContractRef,
  constructGraph,
  constructGraphFunction,
  constructJob,
  constructModule,
  constructNode,
  constructNodeTypeGraphFunction,
  constructRole,
  constructTemplateRef,
  contributionManifestDigest,
  descriptorDigest,
  digestCanonicalIJson,
  edge,
  emptySerializedAttrs,
  graphFunctionDeclarations,
  graphFunctionForVector,
  pluginSelectionDeclarationEntry,
  publicContractCatalogDigest,
  serializeModule
} from "../../build/semantic/code/src/index.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const T223_FIXTURE_ROOT = path.resolve(
  HERE,
  "../fixtures/t223_hello_world_catalog_product"
);
export const T223_FIXTURE_PRODUCT_ID = "fixture.hello";
export const T223_FIXTURE_VERSION = "0.1.0";
export const T223_FIXTURE_PACKAGE_NAME =
  "@abiogenesis-fixtures/t223-hello-world-catalog";
export const T223_FIXTURE_GRAPH_HANDLE =
  "graph-function://fixture/hello-world";
export const T223_FIXTURE_NODE_HANDLE =
  "node-type://fixture/hello-input";
export const T223_FIXTURE_OVERLAY_HANDLE = "overlay://fixture/default";
export const T223_FIXTURE_INTERFACE_REF =
  "interface://fixture/hello-world/v1";

const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;
const MODULE_PATH = "catalog/hello-world.module.json";
const OVERLAY_PATH = "catalog/default-overlay.json";
const CATALOG_PATH = "contracts/public-contract-catalog.json";
const CATALOG_SCHEMA_PATH =
  "contracts/public-contract-catalog.schema.json";
const INPUT_SCHEMA_PATH = "contracts/hello-input.schema.json";
const OUTPUT_SCHEMA_PATH = "contracts/hello-output.schema.json";
const INTERFACE_PATH = "contracts/hello-world.interface.json";
const OVERLAY_SCHEMA_PATH =
  "contracts/catalog-overlay-declaration.schema.json";
const MANIFEST_PATH = "product-toolchain-manifest.json";

const FIXTURE_CONTRACTS = Object.freeze({
  input: "fixture.contract.hello-input",
  output: "fixture.contract.hello-output",
  overlaySchema: "fixture.contract.catalog-overlay-declaration"
});
const INVOKE_CAPABILITY =
  "abg.capability.catalog.invoke-graph-function@5";

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalBytes(value) {
  return Buffer.from(canonicalizeIJson(value), "utf8");
}

function canonicalSemverArgument(value) {
  if (
    typeof value !== "string" ||
    !/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u.test(
      value
    )
  ) {
    throw new TypeError(`--abg-version must be an exact SemVer, received ${JSON.stringify(value)}`);
  }
  return value;
}

function assetSurface(kind, schemaRef) {
  return Object.freeze({
    kind,
    requiredContexts: Object.freeze([]),
    standardsRefs: Object.freeze([
      "specification/requirements/product/REQ-P-CATALOG.md"
    ]),
    outputContractRefs: Object.freeze([schemaRef]),
    constructorRefs: Object.freeze([]),
    constructorInputAssetKinds: Object.freeze([]),
    rendererRefs: Object.freeze([]),
    renderedViewDigestPolicyRef: null,
    sectionKindRefs: Object.freeze([]),
    clauseKindRefs: Object.freeze([]),
    authoritySlots: Object.freeze([]),
    proofObligationRefs: Object.freeze([
      `proof://fixture/hello-world/${kind}`
    ])
  });
}

function helloNode(name, schemaRef, typeRef = null) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    typeRef,
    markov: ["catalog:ready"],
    assetSurface: assetSurface(name.toLowerCase(), schemaRef),
    tags: ["t223", "hello-world"],
    id: `node://fixture/hello-world/${name.toLowerCase()}`
  });
}

function compactGraphFunctionIdentity(graphFunction, graphId, graphFunctionId) {
  if (graphFunction.template.kind !== "inline_graph") {
    throw new TypeError("Hello World declarations require an inline graph");
  }
  const graph = constructGraph({
    ...graphFunction.template.graph,
    id: graphId
  });
  return constructGraphFunction({
    ...graphFunction,
    id: graphFunctionId,
    template: constructTemplateRef({
      ...graphFunction.template,
      graph
    })
  });
}

export function buildT223HelloWorldModule() {
  const input = helloNode("HelloInput", FIXTURE_CONTRACTS.input);
  const output = helloNode("HelloOutput", FIXTURE_CONTRACTS.output);
  const vector = edge([input], output, {
    name: "hello-input-to-output",
    id: "graph-vector://fixture/hello-world/input-to-output",
    declarations: { entries: [] },
    tags: ["t223", "hello-world"]
  }).vectors[0];
  if (vector === undefined) {
    throw new TypeError("Hello World edge did not materialize one vector");
  }
  const graphFunction = compactGraphFunctionIdentity(graphFunctionForVector(vector, {
    name: T223_FIXTURE_GRAPH_HANDLE,
    declarations: graphFunctionDeclarations([
      ...constructAbgFnCompositionDeclarations({
      contractRef: "abg.fn_composition://fixture/hello-world",
      hookRef: "hook://fixture/hello-world/composition",
      regimes: [
        {
          bindingRef:
            "regime-binding://fixture/hello-world/transform/fp",
          stageRole: "transform",
          regime: "F_P",
          role: "construct",
          order: 0,
          authority: "evidence",
          inputCarrierRefs: ["EnginePluginInput"],
          outputCarrierRefs: ["FpDispatchOutcome"],
          evidenceRefs: ["evidence://fixture/hello-world/fp-dispatch"]
        },
        {
          bindingRef:
            "regime-binding://fixture/hello-world/evaluate/fd",
          stageRole: "evaluate",
          regime: "F_D",
          role: "validate",
          order: 1,
          authority: "closure",
          inputCarrierRefs: ["EnginePluginInput"],
          outputCarrierRefs: ["FdEvaluationOutcome"],
          evidenceRefs: ["evidence://fixture/hello-world/fd"]
        },
        {
          bindingRef:
            "regime-binding://fixture/hello-world/evaluate/fp",
          stageRole: "evaluate",
          regime: "F_P",
          role: "validate",
          order: 2,
          authority: "judgment",
          inputCarrierRefs: ["EnginePluginInput"],
          outputCarrierRefs: ["FpEvaluationOutcome"],
          evidenceRefs: ["evidence://fixture/hello-world/fp-evaluate"]
        },
        {
          bindingRef:
            "regime-binding://fixture/hello-world/consequence/fd",
          stageRole: "consequence",
          regime: "F_D",
          role: "observe",
          order: 3,
          authority: "evidence",
          inputCarrierRefs: ["EnginePluginInput"],
          outputCarrierRefs: ["ConsequenceProjectionOutcome"],
          evidenceRefs: ["evidence://fixture/hello-world/consequence"]
        }
      ],
      standardsContextRefs: [
        "specification/requirements/product/REQ-P-CATALOG.md"
      ],
      policyContextRefs: ["policy://fixture/default"],
      carrierContextRefs: [T223_FIXTURE_INTERFACE_REF],
      assuranceContextRefs: ["proof://fixture/hello-world/declared"],
        closureContractRef: "closure://fixture/hello-world/fd-evaluate"
      }).entries,
      pluginSelectionDeclarationEntry({
        fpDispatch: "plugin://abg/fp-dispatch-live",
        fpEvaluator: "plugin://abg/fp-evaluator-live"
      })
    ]),
    tags: ["t223", "hello-world"]
  }), "graph://fixture/hello-world", T223_FIXTURE_GRAPH_HANDLE);
  const nodeType = compactGraphFunctionIdentity(constructNodeTypeGraphFunction(
    helloNode(
      "HelloInputType",
      FIXTURE_CONTRACTS.input,
      T223_FIXTURE_NODE_HANDLE
    ),
    { tags: ["t223", "hello-world"] }
  ), "graph://fixture/hello-input-type", T223_FIXTURE_NODE_HANDLE);
  const role = constructRole({
    name: "fixture_hello_role",
    tags: ["t223", "hello-world"],
    policyHooks: emptySerializedAttrs(),
    id: "role://fixture/hello-world"
  });
  const job = constructJob({
    name: "fixture_hello_job",
    contracts: [
      constructContractRef({
        kind: "graph_function",
        targetId: graphFunction.id
      })
    ],
    roles: [role],
    tags: ["t223", "hello-world"],
    policyHooks: emptySerializedAttrs(),
    id: "job://fixture/hello-world"
  });
  return serializeModule(
    constructModule({
      name: "fixture-hello-world",
      graphs: [],
      graphFunctions: [graphFunction, nodeType],
      refinementBoundaries: [],
      candidateFamilies: [],
      jobs: [job],
      roles: [role],
      operators: [],
      evaluators: [],
      rules: [],
      imports: [],
      policyHooks: emptySerializedAttrs(),
      metadata: emptySerializedAttrs()
    })
  );
}

function schemas() {
  const input = {
    $id: "fixture.schema.hello-input",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    additionalProperties: false,
    properties: {
      greeting: { minLength: 1, type: "string" }
    },
    required: ["greeting"],
    type: "object"
  };
  const output = {
    $id: "fixture.schema.hello-output",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    additionalProperties: false,
    properties: {
      message: { minLength: 1, type: "string" }
    },
    required: ["message"],
    type: "object"
  };
  const overlay = {
    $id: "abg.schema.catalog-overlay-declaration",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    additionalProperties: false,
    properties: {
      graphFunctionRefs: {
        items: { minLength: 1, type: "string" },
        minItems: 1,
        type: "array",
        uniqueItems: true
      },
      kind: { const: "catalog_overlay_declaration" },
      overlayRef: { minLength: 1, type: "string" },
      policyRefs: {
        items: { minLength: 1, type: "string" },
        type: "array",
        uniqueItems: true
      },
      provenanceRefs: {
        items: { minLength: 1, type: "string" },
        minItems: 1,
        type: "array",
        uniqueItems: true
      },
      schemaVersion: { const: 1 }
    },
    required: [
      "kind",
      "schemaVersion",
      "overlayRef",
      "graphFunctionRefs",
      "policyRefs",
      "provenanceRefs"
    ],
    type: "object"
  };
  const catalog = {
    $id: "fixture.schema.public-contract-catalog",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    additionalProperties: false,
    properties: {
      catalogDigest: { pattern: "^sha256:[0-9a-f]{64}$", type: "string" },
      catalogId: { minLength: 1, type: "string" },
      catalogSchemaDigest: {
        pattern: "^sha256:[0-9a-f]{64}$",
        type: "string"
      },
      catalogSchemaPath: { minLength: 1, type: "string" },
      catalogVersion: { const: T223_FIXTURE_VERSION },
      kind: { const: "abg_public_contract_catalog" },
      profile: { const: "catalog-product-v1" },
      rows: { minItems: 1, type: "array" },
      schemaVersion: { const: 1 }
    },
    required: [
      "kind",
      "schemaVersion",
      "catalogId",
      "catalogVersion",
      "catalogDigest",
      "catalogSchemaPath",
      "catalogSchemaDigest",
      "profile",
      "rows"
    ],
    type: "object"
  };
  return Object.freeze({ input, output, overlay, catalog });
}

function publicContractRow({ contractId, relativePath, schemaId, bytes }) {
  const digest = sha256(bytes);
  return Object.freeze({
    contractId,
    contractKind: "schema_asset",
    owningProductId: T223_FIXTURE_PRODUCT_ID,
    version: T223_FIXTURE_VERSION,
    digest,
    authorityRefs: ["fixture://t223/hello-world"],
    capabilityRefs: [],
    nativeLocator: null,
    assetLocator: {
      kind: "asset",
      relativePath,
      schemaId,
      schemaVersion: "1.0.0",
      mediaType: "application/schema+json",
      digest
    },
    operationContract: null
  });
}

function productContentDigest(files) {
  const inventory = [...files.entries()]
    .map(([relativePath, bytes]) => [relativePath, sha256(bytes)])
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
  return digestCanonicalIJson(inventory);
}

async function writeProductFiles(packageRoot) {
  const declaredSchemas = schemas();
  const module = buildT223HelloWorldModule();
  const overlay = {
    kind: "catalog_overlay_declaration",
    schemaVersion: 1,
    overlayRef: T223_FIXTURE_OVERLAY_HANDLE,
    graphFunctionRefs: [T223_FIXTURE_GRAPH_HANDLE],
    policyRefs: ["policy://fixture/default"],
    provenanceRefs: ["fixture://t223/hello-world"]
  };
  const packageMetadata = {
    name: T223_FIXTURE_PACKAGE_NAME,
    version: T223_FIXTURE_VERSION,
    private: true,
    description: "T-223 declarations-only Hello World catalog proof fixture",
    files: ["catalog", "contracts", MANIFEST_PATH]
  };
  const inputSchemaBytes = canonicalBytes(declaredSchemas.input);
  const outputSchemaBytes = canonicalBytes(declaredSchemas.output);
  const overlaySchemaBytes = canonicalBytes(declaredSchemas.overlay);
  const catalogSchemaBytes = canonicalBytes(declaredSchemas.catalog);
  const interfaceAsset = {
    kind: "graph_function_interface",
    schemaVersion: 1,
    interfaceRef: T223_FIXTURE_INTERFACE_REF,
    graphFunctionRef: T223_FIXTURE_GRAPH_HANDLE,
    inputSchema: {
      contractRef: FIXTURE_CONTRACTS.input,
      digest: sha256(inputSchemaBytes),
      path: INPUT_SCHEMA_PATH
    },
    outputSchema: {
      contractRef: FIXTURE_CONTRACTS.output,
      digest: sha256(outputSchemaBytes),
      path: OUTPUT_SCHEMA_PATH
    }
  };
  const interfaceBytes = canonicalBytes(interfaceAsset);
  const files = new Map([
    ["package.json", canonicalBytes(packageMetadata)],
    [MODULE_PATH, canonicalBytes(module)],
    [OVERLAY_PATH, canonicalBytes(overlay)],
    [INPUT_SCHEMA_PATH, inputSchemaBytes],
    [OUTPUT_SCHEMA_PATH, outputSchemaBytes],
    [INTERFACE_PATH, interfaceBytes],
    [OVERLAY_SCHEMA_PATH, overlaySchemaBytes],
    [CATALOG_SCHEMA_PATH, catalogSchemaBytes]
  ]);
  const rows = [
    publicContractRow({
      contractId: FIXTURE_CONTRACTS.input,
      relativePath: INPUT_SCHEMA_PATH,
      schemaId: "fixture.schema.hello-input",
      bytes: inputSchemaBytes
    }),
    publicContractRow({
      contractId: FIXTURE_CONTRACTS.output,
      relativePath: OUTPUT_SCHEMA_PATH,
      schemaId: "fixture.schema.hello-output",
      bytes: outputSchemaBytes
    }),
    publicContractRow({
      contractId: FIXTURE_CONTRACTS.overlaySchema,
      relativePath: OVERLAY_SCHEMA_PATH,
      schemaId: "abg.schema.catalog-overlay-declaration",
      bytes: overlaySchemaBytes
    })
  ];
  const catalogWithoutDigest = {
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "catalog://fixture/hello-world/0.1.0",
    catalogVersion: T223_FIXTURE_VERSION,
    catalogDigest: ZERO_DIGEST,
    catalogSchemaPath: CATALOG_SCHEMA_PATH,
    catalogSchemaDigest: sha256(catalogSchemaBytes),
    profile: "catalog-product-v1",
    rows
  };
  const catalog = Object.freeze({
    ...catalogWithoutDigest,
    catalogDigest: publicContractCatalogDigest(catalogWithoutDigest)
  });
  files.set(CATALOG_PATH, canonicalBytes(catalog));
  const contentDigest = productContentDigest(files);
  const manifest = {
    kind: "abg_product_toolchain_manifest",
    schemaVersion: 1,
    publisher: "fixture",
    productId: T223_FIXTURE_PRODUCT_ID,
    packageName: T223_FIXTURE_PACKAGE_NAME,
    packageVersion: T223_FIXTURE_VERSION,
    productContentDigest: contentDigest,
    publicContractCatalogPath: CATALOG_PATH,
    publicContractCatalogDigest: catalog.catalogDigest,
    publicContractCatalog: catalog,
    runtimeSystemProfile: null,
    productRelativeLocators: [...files.keys()].sort()
  };
  files.set(MANIFEST_PATH, canonicalBytes(manifest));

  for (const [relativePath, bytes] of files) {
    const target = path.join(packageRoot, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  return Object.freeze({
    catalog,
    contentDigest,
    manifest,
    module,
    overlay,
    files
  });
}

function packNpmPackage(packageRoot, artifactRoot) {
  const result = spawnSync(
    "npm",
    [
      "pack",
      packageRoot,
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      artifactRoot
    ],
    {
      encoding: "utf8",
      env: { ...process.env, COPYFILE_DISABLE: "1", LC_ALL: "C" }
    }
  );
  if (result.status !== 0) {
    throw new TypeError(`npm pack failed: ${result.stderr || result.stdout}`);
  }
  const report = JSON.parse(result.stdout);
  const filename = report[0]?.filename;
  if (typeof filename !== "string" || filename.length === 0) {
    throw new TypeError("npm pack did not report one artifact filename");
  }
  return path.join(artifactRoot, filename);
}

function dependency(abgVersion) {
  return Object.freeze({
    productId: "abiogenesis",
    versionConstraint: abgVersion,
    requiredContractRefs: [
      "abg.contract.gtl.m01",
      "abg.contract.gtl.m02"
    ],
    requiredCapabilityRefs: [
      "abg.capability.gtl.admit@5",
      "abg.capability.module.publish@5",
      "abg.capability.catalog.invoke-graph-function@5"
    ]
  });
}

function contributionRow(input, abgVersion, digests) {
  const common = {
    canonicalHandle: input.handle,
    publicKind: input.kind,
    ownerProductId: T223_FIXTURE_PRODUCT_ID,
    ownerVersion: T223_FIXTURE_VERSION,
    declarationRef: input.declarationRef,
    contractRef: input.contractRef,
    interfaceRef: input.kind === "overlay" ? null : input.interfaceRef,
    compatibility: {
      abgVersionRange: abgVersion,
      requiredProductRefs: ["abiogenesis"],
      requiredContractRefs: [
        "abg.contract.gtl.m01",
        "abg.contract.gtl.m02"
      ],
      requiredCapabilityRefs: [
        "abg.capability.gtl.admit@5",
        "abg.capability.module.publish@5",
        "abg.capability.catalog.invoke-graph-function@5"
      ]
    },
    readinessRefs: ["readiness://fixture/hello-world/declared"],
    proofRefs: ["proof://fixture/hello-world/declared"],
    policyRefs: ["policy://fixture/default"],
    capabilityRefs:
      input.kind === "graph_function" ? [INVOKE_CAPABILITY] : [],
    provenanceRefs: ["fixture://t223/hello-world"],
    refinementOfHandle: null,
    overrideOfHandle: null
  };
  if (input.kind === "overlay") {
    return Object.freeze({
      ...common,
      locator: {
        kind: "opaque_overlay_asset",
        assetPath: OVERLAY_PATH,
        schemaId: "abg.schema.catalog-overlay-declaration",
        schemaVersion: "1.0.0",
        schemaDigest: digests.overlaySchema,
        assetDigest: digests.overlay
      }
    });
  }
  return Object.freeze({
    ...common,
    locator: {
      kind: "module_declaration",
      modulePath: MODULE_PATH,
      moduleDigest: digests.module,
      declarationRef: input.declarationRef
    }
  });
}

async function writeSidecars(input) {
  const artifactBytes = await readFile(input.artifactPath);
  const artifactDigest = sha256(artifactBytes);
  const moduleDigest = sha256(await readFile(path.join(input.packageRoot, MODULE_PATH)));
  const overlayDigest = sha256(
    await readFile(path.join(input.packageRoot, OVERLAY_PATH))
  );
  const overlaySchemaDigest = sha256(
    await readFile(path.join(input.packageRoot, OVERLAY_SCHEMA_PATH))
  );
  const contributionWithoutDigests = {
    kind: "catalog_contribution_manifest",
    schemaVersion: 1,
    contributionId: "contribution://fixture/hello-world/0.1.0",
    contributionDigest: ZERO_DIGEST,
    descriptorId: "descriptor://fixture/hello-world/0.1.0",
    descriptorDigest: ZERO_DIGEST,
    productId: T223_FIXTURE_PRODUCT_ID,
    productVersion: T223_FIXTURE_VERSION,
    artifactDigest,
    rows: [
      contributionRow(
        {
          handle: T223_FIXTURE_GRAPH_HANDLE,
          kind: "graph_function",
          declarationRef: T223_FIXTURE_GRAPH_HANDLE,
          contractRef: FIXTURE_CONTRACTS.input,
          interfaceRef: T223_FIXTURE_INTERFACE_REF
        },
        input.abgVersion,
        {
          module: moduleDigest,
          overlay: overlayDigest,
          overlaySchema: overlaySchemaDigest
        }
      ),
      contributionRow(
        {
          handle: T223_FIXTURE_NODE_HANDLE,
          kind: "node_type",
          declarationRef: T223_FIXTURE_NODE_HANDLE,
          contractRef: FIXTURE_CONTRACTS.input,
          interfaceRef: "interface://fixture/hello-input/v1"
        },
        input.abgVersion,
        {
          module: moduleDigest,
          overlay: overlayDigest,
          overlaySchema: overlaySchemaDigest
        }
      ),
      contributionRow(
        {
          handle: T223_FIXTURE_OVERLAY_HANDLE,
          kind: "overlay",
          declarationRef: T223_FIXTURE_OVERLAY_HANDLE,
          contractRef: FIXTURE_CONTRACTS.overlaySchema,
          interfaceRef: null
        },
        input.abgVersion,
        {
          module: moduleDigest,
          overlay: overlayDigest,
          overlaySchema: overlaySchemaDigest
        }
      )
    ]
  };
  const contributionDigest = contributionManifestDigest(
    contributionWithoutDigests
  );
  const descriptorWithoutDigest = {
    kind: "catalog_product_descriptor",
    schemaVersion: 1,
    descriptorId: "descriptor://fixture/hello-world/0.1.0",
    descriptorDigest: ZERO_DIGEST,
    publisher: "fixture",
    productId: T223_FIXTURE_PRODUCT_ID,
    packageName: T223_FIXTURE_PACKAGE_NAME,
    version: T223_FIXTURE_VERSION,
    distributionArtifactDigest: artifactDigest,
    productContentDigest: input.product.contentDigest,
    contributionManifestId: contributionWithoutDigests.contributionId,
    contributionManifestDigest: contributionDigest,
    dependencies: [dependency(input.abgVersion)],
    abgCompatibility: input.abgVersion,
    contractRefs: Object.values(FIXTURE_CONTRACTS).sort(),
    capabilityRefs: [],
    provenanceRefs: ["fixture://t223/hello-world"]
  };
  const descriptor = Object.freeze({
    ...descriptorWithoutDigest,
    descriptorDigest: descriptorDigest(descriptorWithoutDigest)
  });
  const contribution = Object.freeze({
    ...contributionWithoutDigests,
    contributionDigest,
    descriptorDigest: descriptor.descriptorDigest
  });
  const sidecarRoot = path.join(input.root, "sidecars");
  await mkdir(sidecarRoot, { recursive: true });
  await writeFile(
    path.join(sidecarRoot, "product-descriptor.json"),
    canonicalBytes(descriptor)
  );
  await writeFile(
    path.join(sidecarRoot, "contribution-manifest.json"),
    canonicalBytes(contribution)
  );
  return Object.freeze({ artifactDigest, contribution, descriptor });
}

export async function generateT223HelloWorldFixture(input) {
  const abgVersion = canonicalSemverArgument(input.abgVersion);
  const root = path.resolve(input.root);
  await rm(root, { recursive: true, force: true });
  const packageRoot = path.join(root, "package");
  const artifactRoot = path.join(root, ".artifacts");
  await mkdir(artifactRoot, { recursive: true });
  const product = await writeProductFiles(packageRoot);
  const artifactPath = packNpmPackage(packageRoot, artifactRoot);
  const sidecars = await writeSidecars({
    abgVersion,
    artifactPath,
    packageRoot,
    product,
    root
  });
  return Object.freeze({
    abgVersion,
    artifactPath,
    packageRoot,
    product,
    root,
    sidecars
  });
}

async function fileTable(root, prefix = "") {
  const rows = [];
  for (const entry of await readdir(path.join(root, prefix), {
    withFileTypes: true
  })) {
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== ".artifacts") {
        rows.push(...(await fileTable(root, relativePath)));
      }
      continue;
    }
    if (!entry.isFile()) {
      throw new TypeError(`fixture contains a non-file entry: ${relativePath}`);
    }
    rows.push(relativePath);
  }
  return rows.sort();
}

export async function checkT223HelloWorldFixture(input) {
  const temporaryRoot = await mkdtemp(
    path.join(tmpdir(), "abg-t223-hello-fixture-check-")
  );
  try {
    const generated = await generateT223HelloWorldFixture({
      root: path.join(temporaryRoot, "fixture"),
      abgVersion: input.abgVersion
    });
    const expectedFiles = await fileTable(input.root);
    const actualFiles = await fileTable(generated.root);
    if (canonicalizeIJson(expectedFiles) !== canonicalizeIJson(actualFiles)) {
      throw new TypeError(
        `fixture census mismatch: expected ${JSON.stringify(expectedFiles)}, generated ${JSON.stringify(actualFiles)}`
      );
    }
    for (const relativePath of expectedFiles) {
      const expected = await readFile(path.join(input.root, relativePath));
      const actual = await readFile(path.join(generated.root, relativePath));
      if (!expected.equals(actual)) {
        throw new TypeError(`fixture drift: ${relativePath}`);
      }
    }
    return generated;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

function argumentValue(args, flag) {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1] ?? null;
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command !== "generate" && command !== "check" && command !== "pack") {
    throw new TypeError(
      "usage: t223_hello_world_fixture.mjs generate|check|pack --abg-version <version> [--output <path>]"
    );
  }
  const abgVersion = argumentValue(args, "--abg-version");
  if (abgVersion === null) {
    throw new TypeError("--abg-version is required");
  }
  if (command === "generate") {
    const generated = await generateT223HelloWorldFixture({
      root: T223_FIXTURE_ROOT,
      abgVersion
    });
    await rm(path.join(generated.root, ".artifacts"), {
      recursive: true,
      force: true
    });
    return;
  }
  if (command === "check") {
    await checkT223HelloWorldFixture({
      root: T223_FIXTURE_ROOT,
      abgVersion
    });
    return;
  }
  const output = argumentValue(args, "--output");
  if (output === null) {
    throw new TypeError("pack requires --output");
  }
  const temporaryRoot = await mkdtemp(
    path.join(tmpdir(), "abg-t223-hello-fixture-pack-")
  );
  try {
    const generated = await generateT223HelloWorldFixture({
      root: path.join(temporaryRoot, "fixture"),
      abgVersion
    });
    await mkdir(path.resolve(output), { recursive: true });
    await cp(generated.artifactPath, path.join(path.resolve(output), path.basename(generated.artifactPath)));
    await cp(
      path.join(generated.root, "sidecars"),
      path.join(path.resolve(output), "sidecars"),
      { recursive: true }
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  });
}
