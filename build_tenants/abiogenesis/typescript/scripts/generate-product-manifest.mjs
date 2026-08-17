import {
  copyFile,
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
  ABI5_PRODUCT_ID,
  PUBLIC_CATALOG_BINDING_CONTRACTS,
  bindS06PublicFunctionCatalog,
  canonicalJson,
  derivePublicCatalogRowProposals,
  payloadInventoryDigest,
  modulePublicationSemanticDigest,
  sha256Canonical,
  sha256File,
} from "../build/code/src/product/index.js";
import {
  resolveNativeDeclarationClosures,
} from "../build/code/src/product/declaration_exports.js";
import {
  CONSENSUS_FH_DECISION_VALUES,
  CONSENSUS_ROUND_OUTCOME_VALUES,
  CONSENSUS_PUBLIC_SCHEMA,
  CONSENSUS_SCHEMA_ASSET_BINDINGS,
  REVIEW_RULING_KIND_VALUES,
} from "../build/code/src/gtl/consensus_schema.js";
import {
  constructConsensusModulePublication,
  constructHelloWorldModulePublication,
} from "../build/code/src/gtl/index.js";
import {
  PUBLIC_PROJECTION_PAYLOADS,
} from "../build/code/src/shared/public_function_projections.js";
import {
  projectStrictJsonSchema,
} from "../build/code/src/shared/public_function_contracts.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const packageLock = JSON.parse(
  await readFile(join(root, "package-lock.json"), "utf8"),
);
const productId = `product://abiogenesis/typescript-tenant@${packageJson.version}`;

if (
  packageJson.name !== ABI5_PACKAGE_NAME ||
  packageJson.version !== ABI5_PACKAGE_VERSION ||
  productId !== ABI5_PRODUCT_ID
) {
  throw new Error("package metadata and exported ABI5 Product identity disagree");
}

const consensusSchemaPath = "contracts/schemas/consensus.schema.json";
const publicOperationSchemaPath =
  PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.path;
const reviewRulingVocabularyPath =
  "contracts/vocabularies/review-ruling-kind.json";
const consensusRoundOutcomeVocabularyPath =
  "contracts/vocabularies/consensus-round-outcome.json";
const consensusFhDecisionVocabularyPath =
  "contracts/vocabularies/consensus-fh-decision.json";

function closedVocabulary(vocabularyId, values) {
  return {
    kind: "closed_vocabulary",
    schemaVersion: "5.0.0",
    vocabularyId,
    values: [...values],
  };
}

await Promise.all([
  mkdir(dirname(join(root, consensusSchemaPath)), { recursive: true }),
  mkdir(dirname(join(root, reviewRulingVocabularyPath)), { recursive: true }),
]);

await Promise.all([
  rm(join(root, "contracts/public-functions"), { force: true, recursive: true }),
  rm(join(root, "contracts/public-operations"), { force: true, recursive: true }),
  rm(join(root, "contracts/schemas/operations"), { force: true, recursive: true }),
]);

const catalogSchemaPath = "contracts/schemas/public-contract-catalog.schema.json";
const catalogSchema = JSON.parse(
  await readFile(join(root, catalogSchemaPath), "utf8"),
);
function nestedProjectedSchema(schema) {
  const { $schema: _schema, ...projection } = projectStrictJsonSchema(schema);
  return projection;
}
catalogSchema.$defs.PublicCatalogBindingAttempt = nestedProjectedSchema(
  PUBLIC_CATALOG_BINDING_CONTRACTS.attempt,
);
catalogSchema.$defs.PublicCatalogBindingRefusal = nestedProjectedSchema(
  PUBLIC_CATALOG_BINDING_CONTRACTS.refusal,
);

const toolchainRoot = join(root, "build/toolchain");
const typescriptRoot = dirname(require.resolve("typescript/package.json"));
const typescriptLibRoot = join(typescriptRoot, "lib");
const nodeTypesRoot = dirname(require.resolve("@types/node/package.json"));
const undiciTypesRoot = dirname(require.resolve("undici-types/package.json"));
await mkdir(join(toolchainRoot, "node_modules/@types"), { recursive: true });
await Promise.all([
  copyFile(
    join(typescriptLibRoot, "typescript.js"),
    join(toolchainRoot, "typescript.cjs"),
  ),
  copyFile(
    join(typescriptRoot, "LICENSE.txt"),
    join(toolchainRoot, "typescript.LICENSE.txt"),
  ),
  cp(
    nodeTypesRoot,
    join(toolchainRoot, "node_modules/@types/node"),
    { recursive: true },
  ),
  cp(
    undiciTypesRoot,
    join(toolchainRoot, "node_modules/undici-types"),
    { recursive: true },
  ),
]);
for (const entry of await readdir(typescriptLibRoot)) {
  if (/^lib(?:\..+)?\.d\.ts$/u.test(entry)) {
    await copyFile(
      join(typescriptLibRoot, entry),
      join(toolchainRoot, entry),
    );
  }
}

await Promise.all([
  writeFile(
    join(root, consensusSchemaPath),
    `${JSON.stringify(CONSENSUS_PUBLIC_SCHEMA, null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    join(root, publicOperationSchemaPath),
    PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.bytes,
    "utf8",
  ),
  writeFile(
    join(root, catalogSchemaPath),
    `${JSON.stringify(catalogSchema, null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    join(root, reviewRulingVocabularyPath),
    `${JSON.stringify(closedVocabulary(
      "abg.vocabulary.review-ruling-kind",
      REVIEW_RULING_KIND_VALUES,
    ), null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    join(root, consensusRoundOutcomeVocabularyPath),
    `${JSON.stringify(closedVocabulary(
      "abg.vocabulary.consensus-round-outcome",
      CONSENSUS_ROUND_OUTCOME_VALUES,
    ), null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    join(root, consensusFhDecisionVocabularyPath),
    `${JSON.stringify(closedVocabulary(
      "abg.vocabulary.consensus-fh-decision",
      CONSENSUS_FH_DECISION_VALUES,
    ), null, 2)}\n`,
    "utf8",
  ),
]);

await Promise.all(PUBLIC_PROJECTION_PAYLOADS.assets
  .filter(({ path }) => path !== publicOperationSchemaPath)
  .map(async ({ path, bytes }) => {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), bytes, "utf8");
  }));

async function listFiles(path) {
  const files = [];
  async function visit(absolute) {
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) {
      throw new Error(`refusing symbolic-link payload: ${absolute}`);
    }
    if (stat.isDirectory()) {
      for (const entry of (await readdir(absolute)).sort()) {
        await visit(join(absolute, entry));
      }
      return;
    }
    if (stat.isFile()) {
      files.push(relative(root, absolute).split(sep).join("/"));
    }
  }
  await visit(path);
  return files;
}

const bundledDependencyNames = packageJson.bundleDependencies ??
  packageJson.bundledDependencies ?? [];
if (
  !Array.isArray(bundledDependencyNames) ||
  bundledDependencyNames.some(
    (name) =>
      typeof name !== "string" ||
      packageJson.dependencies?.[name] === undefined,
  )
) {
  throw new Error(
    "bundled runtime dependencies must name exact declared dependencies",
  );
}

const lockedPackages = packageLock.packages;
if (
  lockedPackages === null ||
  typeof lockedPackages !== "object" ||
  Array.isArray(lockedPackages)
) {
  throw new Error("package lock does not expose an installed package inventory");
}

function dependencyLocator(ownerLocator, dependencyName) {
  const dependencySuffix = `node_modules/${dependencyName}`;
  let cursor = ownerLocator;
  while (cursor !== "") {
    const nestedCandidate = `${cursor}/${dependencySuffix}`;
    if (lockedPackages[nestedCandidate] !== undefined) {
      return nestedCandidate;
    }
    const parentMarker = cursor.lastIndexOf("/node_modules/");
    cursor = parentMarker === -1 ? "" : cursor.slice(0, parentMarker);
  }
  return lockedPackages[dependencySuffix] === undefined
    ? null
    : dependencySuffix;
}

function bundledDependencyClosure(names) {
  const pending = names.map((name) => `node_modules/${name}`);
  const visited = new Set();
  while (pending.length > 0) {
    const locator = pending.pop();
    if (visited.has(locator)) {
      continue;
    }
    const lockedPackage = lockedPackages[locator];
    if (
      lockedPackage === null ||
      typeof lockedPackage !== "object" ||
      Array.isArray(lockedPackage)
    ) {
      throw new Error(`bundled dependency is absent from package lock: ${locator}`);
    }
    visited.add(locator);
    const requiredDependencies = lockedPackage.dependencies ?? {};
    for (const dependencyName of Object.keys(requiredDependencies).sort()) {
      const dependency = dependencyLocator(locator, dependencyName);
      if (dependency === null) {
        throw new Error(
          `bundled dependency closure is incomplete: ${locator} -> ${dependencyName}`,
        );
      }
      pending.push(dependency);
    }
    const optionalDependencies = lockedPackage.optionalDependencies ?? {};
    for (const dependencyName of Object.keys(optionalDependencies).sort()) {
      const dependency = dependencyLocator(locator, dependencyName);
      if (dependency !== null) {
        pending.push(dependency);
      }
    }
  }
  return [...visited].sort();
}

const bundledDependencyLocators = [];
for (const locator of bundledDependencyClosure(bundledDependencyNames)) {
  const name = locator.slice("node_modules/".length);
  const expectedRoot = join(root, ...locator.split("/"));
  const dependencyEntry = resolve(require.resolve(name));
  const entryRelativeToExpected = relative(
    resolve(expectedRoot),
    dependencyEntry,
  );
  if (
    entryRelativeToExpected === "" ||
    entryRelativeToExpected.startsWith(`..${sep}`) ||
    entryRelativeToExpected === ".."
  ) {
    throw new Error(`bundled dependency resolves outside its exact package root: ${name}`);
  }
  bundledDependencyLocators.push(...await listFiles(expectedRoot));
}

const productRelativeLocators = [
  "package.json",
  ...(await listFiles(join(root, "build"))),
  ...(await listFiles(join(root, "contracts"))),
  ...bundledDependencyLocators,
].sort();

const payloadInventory = [];
for (const path of productRelativeLocators) {
  payloadInventory.push({ path, sha256: await sha256File(join(root, path)) });
}

const manifestSchemaPath = "contracts/schemas/product-toolchain-manifest.schema.json";
const catalogSchemaDigest = await sha256File(join(root, catalogSchemaPath));
const manifestSchemaDigest = await sha256File(join(root, manifestSchemaPath));
const consensusSchemaDigest = await sha256File(join(root, consensusSchemaPath));
const publicOperationSchemaDigest = await sha256File(
  join(root, publicOperationSchemaPath),
);
const reviewRulingVocabularyDigest = await sha256File(
  join(root, reviewRulingVocabularyPath),
);
const consensusRoundOutcomeVocabularyDigest = await sha256File(
  join(root, consensusRoundOutcomeVocabularyPath),
);
const consensusFhDecisionVocabularyDigest = await sha256File(
  join(root, consensusFhDecisionVocabularyPath),
);
const declarationSources = await Promise.all(
  productRelativeLocators
    .filter((path) => /\.d\.(?:c|m)?ts$/u.test(path))
    .map(async (path) => ({ path, bytes: await readFile(join(root, path)) })),
);
const nativeDeclarationClosures = await resolveNativeDeclarationClosures({
  packageName: packageJson.name,
  packageType: packageJson.type === "module" ? "module" : "commonjs",
  packageExports: packageJson.exports,
  declarationSources,
});
if (nativeDeclarationClosures === null) {
  throw new Error("packed native declaration closure is invalid");
}
const nativeClosureByExport = new Map(
  nativeDeclarationClosures.map((closure) => [
    closure.packageExportPath,
    closure,
  ]),
);
function nativeClosureFor(packageExportPath) {
  const closure = nativeClosureByExport.get(packageExportPath);
  if (closure === undefined) {
    throw new Error(`missing native declaration closure: ${packageExportPath}`);
  }
  return closure;
}

function nativeInventoryFor(packageExportPath) {
  return [nativeClosureFor(packageExportPath)];
}

const nativeInventory = nativeInventoryFor("./product");
const abgNativeInventory = nativeInventoryFor("./abg");
const gtlNativeInventory = nativeInventoryFor("./gtl");
const validatorNativeInventory = nativeInventoryFor("./validator");
const hogNativeInventory = nativeInventoryFor("./hog");
const publicNativeClosure = nativeClosureFor("./public");

function nativeContractDigest(inventory) {
  if (inventory.length !== 1) {
    throw new Error("native contract requires one exact package export");
  }
  return sha256Canonical(inventory[0].declarationInventory);
}

function nativeTypedLocator(inventory, namedSymbol) {
  if (inventory.length !== 1) {
    throw new Error("native locator requires one exact package export");
  }
  const closure = inventory[0];
  if (!closure.exportedSymbols.includes(namedSymbol)) {
    throw new Error(
      `native contract symbol ${namedSymbol} is not exported by ${closure.packageExportPath}`,
    );
  }
  return {
    packageName: packageJson.name,
    packageExportPath: closure.packageExportPath,
    namedSymbol,
    declarationPath: closure.declarationPath,
    declarationInventory: closure.declarationInventory,
  };
}

const consensusContractRows = CONSENSUS_SCHEMA_ASSET_BINDINGS.map(
  ([contractId, definitionName]) => ({
  contractId,
  contractVersion: "5.0.0",
  contractDigest: consensusSchemaDigest,
  contractKind: "schema_asset",
  owningProduct: productId,
  requirementAuthorityRefs: [
    "specification/requirements/product/REQ-P-CONSENSUS.md#REQ-P-CONSENSUS-004",
  ],
  capabilityIdentities: ["abg.capability.catalog.invoke-graph-function@5"],
  assetLocator: {
    path: consensusSchemaPath,
    mediaType: "application/schema+json",
    schemaVersion: "5.0.0",
    contentDigest: consensusSchemaDigest,
    definitionRef: `#/$defs/${definitionName}`,
  },
}));

const consensusVocabularyRows = [
  [
    "abg.vocabulary.review-ruling-kind",
    reviewRulingVocabularyPath,
    reviewRulingVocabularyDigest,
    "specification/requirements/product/REQ-P-CONSENSUS.md#REQ-P-CONSENSUS-007",
  ],
  [
    "abg.vocabulary.consensus-round-outcome",
    consensusRoundOutcomeVocabularyPath,
    consensusRoundOutcomeVocabularyDigest,
    "specification/requirements/product/REQ-P-CONSENSUS.md#REQ-P-CONSENSUS-008",
  ],
  [
    "abg.vocabulary.consensus-fh-decision",
    consensusFhDecisionVocabularyPath,
    consensusFhDecisionVocabularyDigest,
    "specification/requirements/product/REQ-P-CONSENSUS.md#REQ-P-CONSENSUS-004",
  ],
].map(([contractId, path, digest, requirementAuthorityRef]) => ({
  contractId,
  contractVersion: "5.0.0",
  contractDigest: digest,
  contractKind: "vocabulary_asset",
  owningProduct: productId,
  requirementAuthorityRefs: [requirementAuthorityRef],
  capabilityIdentities: ["abg.capability.catalog.invoke-graph-function@5"],
  assetLocator: {
    path,
    mediaType: "application/json",
    schemaVersion: "5.0.0",
    contentDigest: digest,
  },
}));

const extantRows = [
  ...consensusContractRows,
  ...consensusVocabularyRows,
  {
    contractId: "abg.contract.product.verification",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(nativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-049",
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-003",
    ],
    capabilityIdentities: ["abg.capability.product.verify@5"],
    nativeTypedLocator: nativeTypedLocator(nativeInventory, "verifyProduct"),
  },
  {
    contractId: "abg.contract.abg.environment-admission",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-EVENTS.md#REQ-R-ABG3-EVENTS-032",
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-005",
    ],
    capabilityIdentities: ["abg.capability.runtime.admit-artifact@5"],
    nativeTypedLocator: nativeTypedLocator(
      abgNativeInventory,
      "AbgEventStore",
    ),
  },
  {
    contractId: "abg.contract.gtl.root-declaration",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(gtlNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md",
      "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-029",
    ],
    capabilityIdentities: ["abg.capability.gtl.declare@5"],
    nativeTypedLocator: nativeTypedLocator(
      gtlNativeInventory,
      "GTL_DECLARATION_CONSTRUCTORS",
    ),
  },
  {
    contractId: "abg.contract.hog.graph-function-catalog",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(nativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-029",
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-051A",
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-053",
    ],
    capabilityIdentities: ["abg.capability.catalog.index-graph-function@5"],
    nativeTypedLocator: nativeTypedLocator(nativeInventory, "buildGraphFunctionCatalog"),
  },
  {
    contractId: "abg.contract.product.invocation-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(nativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-054",
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-062",
    ],
    capabilityIdentities: ["abg.capability.catalog.invoke-graph-function@5"],
    nativeTypedLocator: nativeTypedLocator(
      nativeInventory,
      "constructDirectInvocation",
    ),
  },
  {
    contractId: "abg.contract.abg.invocation-root-admission",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-002",
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-054",
    ],
    capabilityIdentities: ["abg.capability.runtime.admit-root-invocation@5"],
    nativeTypedLocator: nativeTypedLocator(
      abgNativeInventory,
      "admitInvocation",
    ),
  },
  {
    contractId: "abg.contract.product.implementation-resolution-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(nativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-010",
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-054",
    ],
    capabilityIdentities: ["abg.capability.runtime.resolve-root-implementation@5"],
    nativeTypedLocator: nativeTypedLocator(
      nativeInventory,
      "resolveImplementation",
    ),
  },
  {
    contractId: "abg.contract.gtl.materialization-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(gtlNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-003",
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-006",
    ],
    capabilityIdentities: ["abg.capability.gtl.materialize-root@5"],
    nativeTypedLocator: nativeTypedLocator(
      gtlNativeInventory,
      "materializeGraph",
    ),
  },
  {
    contractId: "abg.contract.abg.execution-basis-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-004",
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-010",
    ],
    capabilityIdentities: ["abg.capability.runtime.admit-root-basis@5"],
    nativeTypedLocator: nativeTypedLocator(
      abgNativeInventory,
      "admitExecutionBasis",
    ),
  },
  {
    contractId: "abg.contract.abg.open-call-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-004",
      "specification/requirements/abg/REQ-R-ABG3-EVENTS.md#REQ-R-ABG3-EVENTS-010",
    ],
    capabilityIdentities: ["abg.capability.runtime.open-root-call@5"],
    nativeTypedLocator: nativeTypedLocator(
      abgNativeInventory,
      "openTraversalScope",
    ),
  },
  {
    contractId: "abg.contract.hog.traversal-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(hogNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-005",
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-006",
    ],
    capabilityIdentities: ["abg.capability.hog.traverse-root@5"],
    nativeTypedLocator: nativeTypedLocator(hogNativeInventory, "traverse"),
  },
  {
    contractId: "abg.contract.abg.c-call-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-CCALL.md#-001-uniformity",
      "specification/requirements/abg/REQ-R-ABG3-CCALL.md#-007-shape-preservation",
    ],
    capabilityIdentities: ["abg.capability.runtime.admit-root-c-call@5"],
    nativeTypedLocator: nativeTypedLocator(abgNativeInventory, "openCCall"),
  },
  {
    contractId: "abg.contract.abg.replay-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-EVENTS.md#REQ-R-ABG3-EVENTS-002",
      "specification/requirements/abg/REQ-R-ABG3-EVENTS.md#REQ-R-ABG3-EVENTS-018",
    ],
    capabilityIdentities: ["abg.capability.runtime.replay-root@5"],
    nativeTypedLocator: nativeTypedLocator(abgNativeInventory, "replay"),
  },
  {
    contractId: "abg.contract.hog.judgment-transition-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(hogNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/abg/REQ-R-ABG3-CCALL.md#-008-judgment-vocabulary",
      "specification/requirements/abg/REQ-R-ABG3-INTERPRET.md#REQ-R-ABG3-INTERPRET-005",
    ],
    capabilityIdentities: ["abg.capability.hog.judge-transition-root@5"],
    nativeTypedLocator: nativeTypedLocator(
      hogNativeInventory,
      "proposeJudgmentCandidate",
    ),
  },
  {
    contractId: "abg.contract.gtl.validation-root",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(validatorNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/PRODUCT.md#validation-contract",
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-054",
    ],
    capabilityIdentities: ["abg.capability.gtl.validate@5"],
    nativeTypedLocator: nativeTypedLocator(
      validatorNativeInventory,
      "rawAdmitValue",
    ),
  },
  {
    contractId: "abg.schema.product-toolchain-manifest",
    contractVersion: "5.0.0",
    contractDigest: manifestSchemaDigest,
    contractKind: "schema_asset",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-001",
    ],
    capabilityIdentities: ["abg.capability.product.verify@5"],
    assetLocator: {
      path: manifestSchemaPath,
      mediaType: "application/schema+json",
      schemaVersion: "5.0.0",
      contentDigest: manifestSchemaDigest,
    },
  },
  {
    contractId: "abg.schema.public-contract-catalog",
    contractVersion: "5.0.0",
    contractDigest: catalogSchemaDigest,
    contractKind: "schema_asset",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-002",
    ],
    capabilityIdentities: ["abg.capability.product.verify@5"],
    assetLocator: {
      path: catalogSchemaPath,
      mediaType: "application/schema+json",
      schemaVersion: "5.0.0",
      contentDigest: catalogSchemaDigest,
    },
  },
];

const catalogWithoutDigest = {
  schemaVersion: "5.0.0",
  catalogId: `catalog://abiogenesis/typescript-tenant/public-contracts@${packageJson.version}`,
  catalogVersion: "5.0.0",
  catalogSchemaPath,
  catalogSchemaDigest,
  rows: extantRows,
};

const productContentDigest = payloadInventoryDigest(payloadInventory);
const extantPublicContractCatalog = {
  ...catalogWithoutDigest,
  catalogDigest: sha256Canonical(catalogWithoutDigest),
};
const extantCatalogCoordinate = {
  productId,
  productContentDigest,
  catalogId: extantPublicContractCatalog.catalogId,
  catalogVersion: extantPublicContractCatalog.catalogVersion,
  catalogDigest: extantPublicContractCatalog.catalogDigest,
};
const publicProposalSet = derivePublicCatalogRowProposals(
  productId,
  packageJson.name,
  publicNativeClosure,
);
const catalogBinding = bindS06PublicFunctionCatalog({
  extantCatalog: extantPublicContractCatalog,
  extantCatalogCoordinate,
  productId,
  productContentDigest,
  proposalSequence: publicProposalSet.proposals,
  publicPackageName: packageJson.name,
  publicDeclarationClosure: publicNativeClosure,
});
if (catalogBinding.disposition !== "bound") {
  throw new Error(
    `PFC-F08 refused generated catalog: ${catalogBinding.failureClass} ${catalogBinding.issuePaths.join(", ")}`,
  );
}
const publicContractCatalog = catalogBinding.catalog;
const rows = publicContractCatalog.rows;
const contentIdentity = productContentDigest.slice("sha256:".length);
const descriptorRef =
  `descriptor://abiogenesis/typescript-tenant/${contentIdentity}`;
const contributionManifestRef =
  `contribution-manifest://abiogenesis/conformance/${contentIdentity}`;
const provenanceRef =
  `provenance://abiogenesis/typescript-tenant/${contentIdentity}`;
const placeholderDigest = `sha256:${"0".repeat(64)}`;
const publicationBasis = {
  productId,
  artifactDigest: placeholderDigest,
  productContentDigest,
  productManifestDigest: placeholderDigest,
  packageName: packageJson.name,
  packageVersion: packageJson.version,
};
const modulePublications = [
  constructHelloWorldModulePublication(publicationBasis),
  constructConsensusModulePublication(publicationBasis),
];
const publicationBindings = modulePublications.map((publication) => ({
  moduleRef: publication.moduleRef,
  publicationDigest: modulePublicationSemanticDigest(publication),
})).sort((left, right) => left.moduleRef.localeCompare(right.moduleRef));
const contributionRows = modulePublications.flatMap((publication) =>
  publication.contributions.map((contribution) => ({
    moduleRef: publication.moduleRef,
    handle: contribution.handle,
    kind: contribution.kind,
    declarationOrContractRef: contribution.declarationOrContractRef,
    owningProductId: contribution.owningProductId,
    programMembershipRefs: [...contribution.programMembershipRefs],
    compatibilityRefs: [...contribution.compatibilityRefs],
    provenanceRef,
    readinessPrerequisiteRefs: [...contribution.readinessPrerequisiteRefs],
  }))
).sort((left, right) => {
  const leftKey = `${left.moduleRef}\0${left.handle}`;
  const rightKey = `${right.moduleRef}\0${right.handle}`;
  return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
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
  publicationBindings,
  rows: contributionRows,
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
  publisherNamespace: "abiogenesis",
  contributionManifestRef,
  contributionManifestDigest: sha256Canonical(contributionManifest),
  contributionManifest,
  compatibilityRefs: ["compatibility://abiogenesis/major/5"],
  declaredDependencies: [],
  provenanceRef,
  declaredCapabilityRefs: [
    ...new Set(rows.flatMap((row) => row.capabilityIdentities)),
  ].sort(),
  publicContractCatalog,
};

await writeFile(
  join(root, "product-toolchain-manifest.json"),
  `${canonicalJson(manifest)}\n`,
  "utf8",
);
