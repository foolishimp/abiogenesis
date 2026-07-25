import { lstat, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
  ABI5_PRODUCT_ID,
  canonicalJson,
  payloadInventoryDigest,
  sha256Canonical,
  sha256File,
} from "../build/code/src/product/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const productId = `product://abiogenesis/typescript-tenant@${packageJson.version}`;

if (
  packageJson.name !== ABI5_PACKAGE_NAME ||
  packageJson.version !== ABI5_PACKAGE_VERSION ||
  productId !== ABI5_PRODUCT_ID
) {
  throw new Error("package metadata and exported ABI5 Product identity disagree");
}

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
const productDeclarationPath = "build/code/src/product/index.d.ts";
const productDeclarationDigest = await sha256File(join(root, productDeclarationPath));
const nativeInventory = [
  {
    packageExportPath: "./product",
    declarationPath: productDeclarationPath,
    declarationDigest: productDeclarationDigest,
  },
];
const abgDeclarationPath = "build/code/src/abg/index.d.ts";
const abgDeclarationDigest = await sha256File(join(root, abgDeclarationPath));
const abgNativeInventory = [
  {
    packageExportPath: "./abg",
    declarationPath: abgDeclarationPath,
    declarationDigest: abgDeclarationDigest,
  },
];
const gtlDeclarationPath = "build/code/src/gtl/index.d.ts";
const gtlNativeInventory = [
  {
    packageExportPath: "./gtl",
    declarationPath: gtlDeclarationPath,
    declarationDigest: await sha256File(join(root, gtlDeclarationPath)),
  },
];
const validatorDeclarationPath = "build/code/src/validator/index.d.ts";
const validatorNativeInventory = [
  {
    packageExportPath: "./validator",
    declarationPath: validatorDeclarationPath,
    declarationDigest: await sha256File(join(root, validatorDeclarationPath)),
  },
];
const hogDeclarationPath = "build/code/src/hog/index.d.ts";
const hogNativeInventory = [
  {
    packageExportPath: "./hog",
    declarationPath: hogDeclarationPath,
    declarationDigest: await sha256File(join(root, hogDeclarationPath)),
  },
];
const publicDeclarationPath = "build/code/src/public/index.d.ts";
const publicNativeInventory = [
  {
    packageExportPath: "./public",
    declarationPath: publicDeclarationPath,
    declarationDigest: await sha256File(join(root, publicDeclarationPath)),
  },
];

const consensusContractRows = [
  ["abg.schema.consensus-subject", "isConsensusSubject"],
  ["abg.schema.consensus-panel", "isConsensusPanel"],
  ["abg.schema.consensus-reviewer-profile", "isConsensusReviewerProfile"],
  ["abg.schema.review-findings", "isReviewFindings"],
  ["abg.schema.review-rulings", "isReviewRulings"],
  ["abg.schema.consensus-round-policy", "isConsensusRoundPolicy"],
  ["abg.schema.consensus-round-outcome", "isConsensusRoundOutcome"],
  ["abg.schema.consensus-result", "isConsensusResult"],
  ["abg.schema.ticket-consensus-projection", "isTicketConsensusProjection"],
].map(([contractId, namedSymbol]) => ({
  contractId,
  contractVersion: "5.0.0",
  contractDigest: sha256Canonical(gtlNativeInventory),
  contractKind: "native_typed_group",
  owningProduct: productId,
  requirementAuthorityRefs: [
    "specification/requirements/product/REQ-P-CONSENSUS.md#REQ-P-CONSENSUS-004",
  ],
  capabilityIdentities: ["abg.capability.catalog.invoke-graph-function@5"],
  nativeTypedLocator: {
    packageName: packageJson.name,
    packageExportPath: "./gtl",
    namedSymbol,
    declarationPath: gtlDeclarationPath,
  },
}));

const consensusVocabularyRows = [
  [
    "abg.vocabulary.review-ruling-kind",
    "REVIEW_RULING_KIND_VALUES",
    "specification/requirements/product/REQ-P-CONSENSUS.md#REQ-P-CONSENSUS-007",
  ],
  [
    "abg.vocabulary.consensus-round-outcome",
    "CONSENSUS_ROUND_OUTCOME_VALUES",
    "specification/requirements/product/REQ-P-CONSENSUS.md#REQ-P-CONSENSUS-008",
  ],
].map(([contractId, namedSymbol, requirementAuthorityRef]) => ({
  contractId,
  contractVersion: "5.0.0",
  contractDigest: sha256Canonical(gtlNativeInventory),
  contractKind: "native_typed_group",
  owningProduct: productId,
  requirementAuthorityRefs: [requirementAuthorityRef],
  capabilityIdentities: ["abg.capability.catalog.invoke-graph-function@5"],
  nativeTypedLocator: {
    packageName: packageJson.name,
    packageExportPath: "./gtl",
    namedSymbol,
    declarationPath: gtlDeclarationPath,
  },
}));

const rows = [
  ...consensusContractRows,
  ...consensusVocabularyRows,
  {
    contractId: "abg.contract.public.root-invocation",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(publicNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-054",
      "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-062",
      "specification/requirements/product/REQ-P-SCENARIOS.md#REQ-P-SCENARIOS-008",
    ],
    capabilityIdentities: ["abg.capability.catalog.invoke-graph-function@5"],
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./public",
      namedSymbol: "applyRootPublicInvocation",
      declarationPath: publicDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.product.verification",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(nativeInventory),
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
      declarationPath: productDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.abg.environment-admission",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(abgNativeInventory),
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
      declarationPath: abgDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.gtl.root-declaration",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(gtlNativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md",
      "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-029",
    ],
    capabilityIdentities: ["abg.capability.gtl.author@5"],
    nativeTypedLocator: {
      packageName: packageJson.name,
      packageExportPath: "./gtl",
      namedSymbol: "constructHelloWorldModulePublication",
      declarationPath: gtlDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.abg.catalog-root-admission",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(abgNativeInventory),
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
      declarationPath: abgDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.product.invocation-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(nativeInventory),
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
      declarationPath: productDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.abg.invocation-root-admission",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(abgNativeInventory),
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
      declarationPath: abgDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.product.implementation-resolution-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(nativeInventory),
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
      declarationPath: productDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.gtl.materialization-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(gtlNativeInventory),
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
      declarationPath: gtlDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.abg.execution-basis-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(abgNativeInventory),
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
      declarationPath: abgDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.abg.open-call-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(abgNativeInventory),
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
      declarationPath: abgDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.hog.traversal-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(hogNativeInventory),
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
      declarationPath: hogDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.abg.c-call-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(abgNativeInventory),
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
      declarationPath: abgDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.abg.replay-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(abgNativeInventory),
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
      declarationPath: abgDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.hog.judgment-transition-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(hogNativeInventory),
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
      declarationPath: hogDeclarationPath,
    },
  },
  {
    contractId: "abg.contract.gtl.validation-root",
    contractVersion: "5.0.0",
    contractDigest: sha256Canonical(validatorNativeInventory),
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

const manifest = {
  kind: "abg_product_toolchain_manifest",
  schemaVersion: "5.0.0",
  productId,
  packageName: packageJson.name,
  packageVersion: packageJson.version,
  productContentDigest: payloadInventoryDigest(payloadInventory),
  productRelativeLocators,
  publicContractCatalog: {
    ...catalogWithoutDigest,
    catalogDigest: sha256Canonical(catalogWithoutDigest),
  },
};

await writeFile(
  join(root, "product-toolchain-manifest.json"),
  `${canonicalJson(manifest)}\n`,
  "utf8",
);
