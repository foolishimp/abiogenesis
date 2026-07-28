import {
  copyFile,
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
  ABI5_PRODUCT_ID,
  canonicalJson,
  payloadInventoryDigest,
  modulePublicationSemanticDigest,
  sha256Canonical,
  sha256File,
} from "../build/code/src/product/index.js";
import * as productPublicApi from "../build/code/src/product/index.js";
import * as abgPublicApi from "../build/code/src/abg/index.js";
import * as gtlPublicApi from "../build/code/src/gtl/index.js";
import * as hogPublicApi from "../build/code/src/hog/index.js";
import * as publicApi from "../build/code/src/public/index.js";
import * as validatorPublicApi from "../build/code/src/validator/index.js";
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
  PUBLIC_OPERATION_SCHEMA,
} from "../build/code/src/public/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
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
  "contracts/schemas/public-operation.schema.json";
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
    `${JSON.stringify(PUBLIC_OPERATION_SCHEMA, null, 2)}\n`,
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

const productRelativeLocators = [
  "package.json",
  ...(await listFiles(join(root, "build"))),
  ...(await listFiles(join(root, "contracts"))),
].sort();

const payloadInventory = [];
for (const path of productRelativeLocators) {
  payloadInventory.push({ path, sha256: await sha256File(join(root, path)) });
}

const catalogSchemaPath = "contracts/schemas/public-contract-catalog.schema.json";
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
const productDeclarationPath = "build/code/src/product/index.d.ts";
const productDeclarationDigest = await sha256File(join(root, productDeclarationPath));
const nativeInventory = [
  {
    packageExportPath: "./product",
    declarationPath: productDeclarationPath,
    declarationDigest: productDeclarationDigest,
    exportedSymbols: Object.keys(productPublicApi).sort(),
  },
];
const abgDeclarationPath = "build/code/src/abg/index.d.ts";
const abgDeclarationDigest = await sha256File(join(root, abgDeclarationPath));
const abgNativeInventory = [
  {
    packageExportPath: "./abg",
    declarationPath: abgDeclarationPath,
    declarationDigest: abgDeclarationDigest,
    exportedSymbols: Object.keys(abgPublicApi).sort(),
  },
];
const gtlDeclarationPath = "build/code/src/gtl/index.d.ts";
const gtlNativeInventory = [
  {
    packageExportPath: "./gtl",
    declarationPath: gtlDeclarationPath,
    declarationDigest: await sha256File(join(root, gtlDeclarationPath)),
    exportedSymbols: Object.keys(gtlPublicApi).sort(),
  },
];
const validatorDeclarationPath = "build/code/src/validator/index.d.ts";
const validatorNativeInventory = [
  {
    packageExportPath: "./validator",
    declarationPath: validatorDeclarationPath,
    declarationDigest: await sha256File(join(root, validatorDeclarationPath)),
    exportedSymbols: Object.keys(validatorPublicApi).sort(),
  },
];
const hogDeclarationPath = "build/code/src/hog/index.d.ts";
const hogNativeInventory = [
  {
    packageExportPath: "./hog",
    declarationPath: hogDeclarationPath,
    declarationDigest: await sha256File(join(root, hogDeclarationPath)),
    exportedSymbols: Object.keys(hogPublicApi).sort(),
  },
];
const publicDeclarationPath = "build/code/src/public/index.d.ts";
const publicNativeInventory = [
  {
    packageExportPath: "./public",
    declarationPath: publicDeclarationPath,
    declarationDigest: await sha256File(join(root, publicDeclarationPath)),
    exportedSymbols: Object.keys(publicApi).sort(),
  },
];

function nativeContractDigest(inventory) {
  return sha256Canonical(inventory.map((entry) => ({
    packageExportPath: entry.packageExportPath,
    declarationPath: entry.declarationPath,
    declarationDigest: entry.declarationDigest,
  })));
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

const publicOperationRows = [
  [
    "abg.schema.public-operation-contract",
    undefined,
    "PUBLIC_OPERATION_SCHEMA",
  ],
  [
    "abg.schema.public-operation-invocation",
    "RootPublicInvocation",
    "parseRootPublicInvocation",
  ],
  [
    "abg.schema.public-operation-outcome",
    "PublicOutcome",
    "applyRootPublicInvocation",
  ],
].map(([contractId, definitionName, namedSymbol]) => ({
  contractId,
  contractVersion: "5.0.0",
  contractDigest: publicOperationSchemaDigest,
  contractKind: "serialized_native_contract",
  owningProduct: productId,
  requirementAuthorityRefs: [
    "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-009",
    "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-010",
  ],
  capabilityIdentities: ["abg.capability.operator.public-contract@5"],
  nativeTypedLocator: {
    packageName: packageJson.name,
    packageExportPath: "./public",
    namedSymbol,
    exportedSymbols: publicNativeInventory[0].exportedSymbols,
    declarationPath: publicDeclarationPath,
  },
  assetLocator: {
    path: publicOperationSchemaPath,
    mediaType: "application/schema+json",
    schemaVersion: "5.0.0",
    contentDigest: publicOperationSchemaDigest,
    ...(definitionName === undefined
      ? {}
      : { definitionRef: `#/$defs/${definitionName}` }),
  },
}));

const rows = [
  ...consensusContractRows,
  ...consensusVocabularyRows,
  ...publicOperationRows,
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./product",
      namedSymbol: "verifyProduct",
      exportedSymbols: nativeInventory[0].exportedSymbols,
      declarationPath: productDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./abg",
      namedSymbol: "AbgEventStore",
      exportedSymbols: abgNativeInventory[0].exportedSymbols,
      declarationPath: abgDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./gtl",
      namedSymbol: "GTL_DECLARATION_CONSTRUCTORS",
      exportedSymbols: gtlNativeInventory[0].exportedSymbols,
      declarationPath: gtlDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.abg.catalog-root-admission",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-029",
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-051A",
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-053",
    ],
    capabilityIdentities: ["abg.capability.catalog.admit-root@5"],
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./abg",
      namedSymbol: "admitCatalog",
      exportedSymbols: abgNativeInventory[0].exportedSymbols,
      declarationPath: abgDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./product",
      namedSymbol: "constructDirectInvocation",
      exportedSymbols: nativeInventory[0].exportedSymbols,
      declarationPath: productDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./abg",
      namedSymbol: "admitInvocation",
      exportedSymbols: abgNativeInventory[0].exportedSymbols,
      declarationPath: abgDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./product",
      namedSymbol: "resolveImplementation",
      exportedSymbols: nativeInventory[0].exportedSymbols,
      declarationPath: productDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./gtl",
      namedSymbol: "materializeGraph",
      exportedSymbols: gtlNativeInventory[0].exportedSymbols,
      declarationPath: gtlDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./abg",
      namedSymbol: "admitExecutionBasis",
      exportedSymbols: abgNativeInventory[0].exportedSymbols,
      declarationPath: abgDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./abg",
      namedSymbol: "openCall",
      exportedSymbols: abgNativeInventory[0].exportedSymbols,
      declarationPath: abgDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./hog",
      namedSymbol: "traverse",
      exportedSymbols: hogNativeInventory[0].exportedSymbols,
      declarationPath: hogDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./abg",
      namedSymbol: "openCCall",
      exportedSymbols: abgNativeInventory[0].exportedSymbols,
      declarationPath: abgDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./abg",
      namedSymbol: "replay",
      exportedSymbols: abgNativeInventory[0].exportedSymbols,
      declarationPath: abgDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./hog",
      namedSymbol: "proposeJudgment",
      exportedSymbols: hogNativeInventory[0].exportedSymbols,
      declarationPath: hogDeclarationPath,
    },
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
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./validator",
      namedSymbol: "rawAdmitValue",
      exportedSymbols: validatorNativeInventory[0].exportedSymbols,
      declarationPath: validatorDeclarationPath,
    },
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
  catalogVersion: packageJson.version,
  catalogSchemaPath,
  catalogSchemaDigest,
  rows,
};

const productContentDigest = payloadInventoryDigest(payloadInventory);
const contentIdentity = productContentDigest.slice("sha256:".length);
const descriptorRef =
  `descriptor://abiogenesis/typescript-tenant/${contentIdentity}`;
const contributionManifestRef =
  `contribution-manifest://abiogenesis/conformance/${contentIdentity}`;
const provenanceRef =
  `provenance://abiogenesis/typescript-tenant/${contentIdentity}`;
const publicContractCatalog = {
  ...catalogWithoutDigest,
  catalogDigest: sha256Canonical(catalogWithoutDigest),
};
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
