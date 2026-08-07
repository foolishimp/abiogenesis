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
  HELLO_WORLD_IDS,
  RECURSION_HELLO_IDS,
  constructConsensusModulePublication,
  constructHelloWorldModulePublication,
} from "../build/code/src/gtl/index.js";
import {
  GTL_PROGRAM_DIAGNOSTIC_ID_VALUES,
  GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES,
  typecheckGtlProgram,
} from "../build/code/src/validator/conformance.js";
import {
  GTL_PUBLIC_SCHEMA,
} from "../build/code/src/validator/public_schema.js";
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
const gtlSchemaPath = "contracts/schemas/gtl-language.schema.json";
const gtlDiagnosticVocabularyPath =
  "contracts/vocabularies/gtl-program-diagnostic-id.json";
const gtlRepairVocabularyPath =
  "contracts/vocabularies/gtl-program-repair-edit-class.json";
const gtlConformanceCorpusPath =
  "contracts/corpus/gtl-language-conformance-corpus.json";

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
  mkdir(dirname(join(root, gtlConformanceCorpusPath)), { recursive: true }),
]);

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function constructGtlCorpusInput(module, programRef, caseName) {
  return {
    kind: "gtl_program_conformance_input",
    schemaVersion: "5.0.0",
    subjectRef: `subject://abiogenesis/gtl-conformance-corpus/${caseName}`,
    programRef,
    module,
  };
}

function constructGtlConformanceCorpus() {
  const placeholderDigest = `sha256:${"0".repeat(64)}`;
  const corpusModule = constructHelloWorldModulePublication({
    productId,
    artifactDigest: placeholderDigest,
    productContentDigest: placeholderDigest,
    productManifestDigest: placeholderDigest,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  });
  const cases = [];
  const add = (caseName, module, programRef, expectedDiagnosticIds) => {
    cases.push({
      caseRef: `gtl-conformance-case://abiogenesis/${caseName}@5`,
      input: constructGtlCorpusInput(module, programRef, caseName),
      expectedDiagnosticIds: [...expectedDiagnosticIds].sort(compareText),
    });
  };

  for (const program of corpusModule.programs) {
    const caseName = program.programRef
      .replace("program://abiogenesis/conformance/", "")
      .replace(/@5$/u, "");
    if (!/^[a-z0-9-]+$/u.test(caseName)) {
      throw new Error(`GTL corpus cannot derive a stable case name for ${program.programRef}`);
    }
    add(`valid-${caseName}`, corpusModule, program.programRef, []);
  }

  const conflictingIdentity = structuredClone(corpusModule);
  const conflictingGraphFunction = structuredClone(
    conflictingIdentity.graphFunctions.find(
      (candidate) => candidate.id === HELLO_WORLD_IDS.graphFunctionRef,
    ),
  );
  if (conflictingGraphFunction === undefined) {
    throw new Error("GTL corpus cannot locate Hello World GraphFunction");
  }
  conflictingGraphFunction.name = "Conflicting human label";
  conflictingIdentity.graphFunctions.push(conflictingGraphFunction);
  add(
    "same-id-different-carrier",
    conflictingIdentity,
    HELLO_WORLD_IDS.programRef,
    [
      "abg://gtl-program/graph-function/unique-publication",
    ],
  );

  add(
    "unresolved-program-reference",
    corpusModule,
    "program://abiogenesis/conformance/not-published@5",
    ["abg://gtl-program/module/no-untracked-graph-function"],
  );

  const unauthorizedCycle = structuredClone(corpusModule);
  const cyclicGraphFunction = unauthorizedCycle.graphFunctions.find(
    (candidate) => candidate.id === HELLO_WORLD_IDS.graphFunctionRef,
  );
  if (cyclicGraphFunction === undefined) {
    throw new Error("GTL corpus cannot construct unauthorized cycle");
  }
  cyclicGraphFunction.template.nodes[0].term = {
    kind: "c_workflow",
    inputCarrierRef: cyclicGraphFunction.inputs[0],
    outputCarrierRef: cyclicGraphFunction.outputs[0],
    graphFunctionRef: cyclicGraphFunction.id,
  };
  add(
    "unauthorized-call-cycle",
    unauthorizedCycle,
    HELLO_WORLD_IDS.programRef,
    ["abg://gtl-program/graph/node-reachable-or-bound"],
  );

  const emptyTerminal = structuredClone(corpusModule);
  const identityGraphFunction = emptyTerminal.graphFunctions.find(
    (candidate) => candidate.id === HELLO_WORLD_IDS.graphFunctionRef,
  );
  if (identityGraphFunction === undefined) {
    throw new Error("GTL corpus cannot construct terminal identity");
  }
  const identityTerminal = identityGraphFunction.template.nodes[0];
  identityTerminal.term = {
    kind: "c_identity",
    inputCarrierRef: identityTerminal.term.inputCarrierRef,
    outputCarrierRef: identityTerminal.term.inputCarrierRef,
  };
  add(
    "standalone-terminal-identity",
    emptyTerminal,
    HELLO_WORLD_IDS.programRef,
    [
      "abg://gtl-program/graph/node-reachable-or-bound",
      "abg://gtl-program/graph/output-derivable",
    ],
  );

  for (const entry of cases) {
    const report = typecheckGtlProgram(entry.input);
    const observed = [...new Set(
      report.issues.map((issue) => issue.diagnosticId),
    )].sort(compareText);
    if (canonicalJson(observed) !== canonicalJson(entry.expectedDiagnosticIds)) {
      throw new Error(
        `GTL corpus expectation drift for ${entry.caseRef}: ${canonicalJson(observed)}`,
      );
    }
  }
  const entriesDigest = sha256Canonical(cases);
  return {
    kind: "gtl_language_conformance_corpus",
    schemaVersion: "5.0.0",
    corpusRef:
      `gtl-language-conformance-corpus://abiogenesis/${entriesDigest.slice("sha256:".length)}`,
    entriesDigest,
    diagnosticVocabularyContractId:
      "abg.vocabulary.gtl-program-diagnostic-id",
    entries: cases,
  };
}

const gtlConformanceCorpus = constructGtlConformanceCorpus();

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
    join(root, gtlSchemaPath),
    `${JSON.stringify(GTL_PUBLIC_SCHEMA, null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    join(root, gtlDiagnosticVocabularyPath),
    `${JSON.stringify(closedVocabulary(
      "abg.vocabulary.gtl-program-diagnostic-id",
      GTL_PROGRAM_DIAGNOSTIC_ID_VALUES,
    ), null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    join(root, gtlRepairVocabularyPath),
    `${JSON.stringify(closedVocabulary(
      "abg.vocabulary.gtl-program-repair-edit-class",
      GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES,
    ), null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    join(root, gtlConformanceCorpusPath),
    `${canonicalJson(gtlConformanceCorpus)}\n`,
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
const gtlSchemaDigest = await sha256File(join(root, gtlSchemaPath));
const gtlDiagnosticVocabularyDigest = await sha256File(
  join(root, gtlDiagnosticVocabularyPath),
);
const gtlRepairVocabularyDigest = await sha256File(
  join(root, gtlRepairVocabularyPath),
);
const gtlConformanceCorpusDigest = await sha256File(
  join(root, gtlConformanceCorpusPath),
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
function nativeInventoryFor(packageExportPath) {
  const closure = nativeClosureByExport.get(packageExportPath);
  if (closure === undefined) {
    throw new Error(`missing native declaration closure: ${packageExportPath}`);
  }
  return [closure];
}

const nativeInventory = nativeInventoryFor("./product");
const abgNativeInventory = nativeInventoryFor("./abg");
const gtlNativeInventory = nativeInventoryFor("./gtl");
const gtlM01NativeInventory = nativeInventoryFor("./gtl/m01");
const gtlM02NativeInventory = nativeInventoryFor("./gtl/m02");
const abgM03NativeInventory = nativeInventoryFor("./abg/m03");
const validatorNativeInventory = nativeInventoryFor("./validator");
const hogNativeInventory = nativeInventoryFor("./hog");
const publicNativeInventory = nativeInventoryFor("./public");

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
  nativeTypedLocator: nativeTypedLocator(publicNativeInventory, namedSymbol),
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

const gtlDeclareCapabilityIdentities = [
  "abg.capability.gtl.declare@5",
  "abg.capability.gtl.admit@5",
  "abg.capability.gtl.serialize@5",
];
const gtlModuleCapabilityIdentities = [
  "abg.capability.gtl.admit@5",
  "abg.capability.gtl.serialize@5",
  "abg.capability.module.publish@5",
];
const gtlAdmitCapabilityIdentities = ["abg.capability.gtl.admit@5"];
const gtlSerializeCapabilityIdentities = ["abg.capability.gtl.serialize@5"];
const gtlTypecheckCapabilityIdentities = ["abg.capability.gtl.typecheck@5"];
const gtlAuthorityRefs = [
  "specification/requirements/gtl/REQ-L-GTL3-LAWS.md#REQ-L-GTL3-LAWS-019",
  "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-006A",
  "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-007A",
];

function serializedGtlRow(
  contractId,
  definitionName,
  inventory,
  namedSymbol,
  capabilityIdentities,
) {
  return {
    contractId,
    contractVersion: "5.0.0",
    contractDigest: gtlSchemaDigest,
    contractKind: "serialized_native_contract",
    owningProduct: productId,
    requirementAuthorityRefs: gtlAuthorityRefs,
    capabilityIdentities,
    nativeTypedLocator: nativeTypedLocator(inventory, namedSymbol),
    assetLocator: {
      path: gtlSchemaPath,
      mediaType: "application/schema+json",
      schemaVersion: "5.0.0",
      contentDigest: gtlSchemaDigest,
      definitionRef: `#/$defs/${definitionName}`,
    },
  };
}

const gtlContractRows = [
  {
    contractId: "abg.contract.gtl.m01",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(gtlM01NativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-005",
    ],
    capabilityIdentities: gtlDeclareCapabilityIdentities,
    nativeTypedLocator: nativeTypedLocator(
      gtlM01NativeInventory,
      "constructGraphFunction",
    ),
  },
  {
    contractId: "abg.contract.gtl.m02",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(gtlM02NativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-005",
    ],
    capabilityIdentities: gtlModuleCapabilityIdentities,
    nativeTypedLocator: nativeTypedLocator(
      gtlM02NativeInventory,
      "modulePublication",
    ),
  },
  {
    contractId: "abg.contract.abg.m03",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgM03NativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-005",
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-006",
    ],
    capabilityIdentities: gtlTypecheckCapabilityIdentities,
    nativeTypedLocator: nativeTypedLocator(
      abgM03NativeInventory,
      "isGtlProgramDiagnosticId",
    ),
  },
  serializedGtlRow(
    "abg.schema.gtl-graph-function",
    "GtlGraphFunction",
    gtlM01NativeInventory,
    "admitGraphFunction",
    gtlAdmitCapabilityIdentities,
  ),
  serializedGtlRow(
    "abg.contract.gtl.graph-function-canonical-serialization",
    "GtlGraphFunction",
    gtlM01NativeInventory,
    "serializeGraphFunction",
    gtlSerializeCapabilityIdentities,
  ),
  serializedGtlRow(
    "abg.schema.gtl-module",
    "GtlModule",
    gtlM02NativeInventory,
    "admitModule",
    gtlAdmitCapabilityIdentities,
  ),
  serializedGtlRow(
    "abg.contract.gtl.module-canonical-serialization",
    "GtlModule",
    gtlM02NativeInventory,
    "serializeModule",
    gtlSerializeCapabilityIdentities,
  ),
  serializedGtlRow(
    "abg.schema.gtl-c-program",
    "GtlCProgram",
    gtlM01NativeInventory,
    "admitCProgramSyntax",
    gtlAdmitCapabilityIdentities,
  ),
  serializedGtlRow(
    "abg.contract.gtl.c-program-canonical-serialization",
    "GtlCProgram",
    gtlM01NativeInventory,
    "serializeCProgramCanonical",
    gtlSerializeCapabilityIdentities,
  ),
  serializedGtlRow(
    "abg.schema.gtl-program-conformance-input",
    "GtlProgramConformanceInput",
    abgM03NativeInventory,
    "GtlProgramConformanceInput",
    gtlTypecheckCapabilityIdentities,
  ),
  {
    contractId: "abg.schema.gtl-language-conformance-corpus",
    contractVersion: "5.0.0",
    contractDigest: gtlSchemaDigest,
    contractKind: "schema_asset",
    owningProduct: productId,
    requirementAuthorityRefs: gtlAuthorityRefs,
    capabilityIdentities: gtlTypecheckCapabilityIdentities,
    assetLocator: {
      path: gtlSchemaPath,
      mediaType: "application/schema+json",
      schemaVersion: "5.0.0",
      contentDigest: gtlSchemaDigest,
      definitionRef: "#/$defs/GtlLanguageConformanceCorpus",
    },
  },
  serializedGtlRow(
    "abg.contract.abg.gtl-program-conformance-admission",
    "GtlProgramConformanceInput",
    abgM03NativeInventory,
    "admitGtlProgramConformanceInput",
    gtlAdmitCapabilityIdentities,
  ),
  {
    contractId: "abg.contract.abg.gtl-program-typecheck",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgM03NativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: gtlAuthorityRefs,
    capabilityIdentities: gtlTypecheckCapabilityIdentities,
    nativeTypedLocator: nativeTypedLocator(
      abgM03NativeInventory,
      "typecheckGtlProgram",
    ),
  },
  {
    contractId: "abg.vocabulary.gtl-program-diagnostic-id",
    contractVersion: "5.0.0",
    contractDigest: gtlDiagnosticVocabularyDigest,
    contractKind: "serialized_native_contract",
    owningProduct: productId,
    requirementAuthorityRefs: gtlAuthorityRefs,
    capabilityIdentities: gtlTypecheckCapabilityIdentities,
    nativeTypedLocator: nativeTypedLocator(
      abgM03NativeInventory,
      "GTL_PROGRAM_DIAGNOSTIC_ID_VALUES",
    ),
    assetLocator: {
      path: gtlDiagnosticVocabularyPath,
      mediaType: "application/json",
      schemaVersion: "5.0.0",
      contentDigest: gtlDiagnosticVocabularyDigest,
    },
  },
  {
    contractId: "abg.vocabulary.gtl-program-repair-edit-class",
    contractVersion: "5.0.0",
    contractDigest: gtlRepairVocabularyDigest,
    contractKind: "serialized_native_contract",
    owningProduct: productId,
    requirementAuthorityRefs: gtlAuthorityRefs,
    capabilityIdentities: gtlTypecheckCapabilityIdentities,
    nativeTypedLocator: nativeTypedLocator(
      abgM03NativeInventory,
      "GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES",
    ),
    assetLocator: {
      path: gtlRepairVocabularyPath,
      mediaType: "application/json",
      schemaVersion: "5.0.0",
      contentDigest: gtlRepairVocabularyDigest,
    },
  },
  {
    contractId: "abg.contract.abg.gtl-program-default-admissible-repairs",
    contractVersion: "5.0.0",
    contractDigest: nativeContractDigest(abgM03NativeInventory),
    contractKind: "native_typed_group",
    owningProduct: productId,
    requirementAuthorityRefs: gtlAuthorityRefs,
    capabilityIdentities: gtlTypecheckCapabilityIdentities,
    nativeTypedLocator: nativeTypedLocator(
      abgM03NativeInventory,
      "GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS",
    ),
  },
  {
    contractId: "abg.asset.gtl.language-conformance-corpus",
    contractVersion: "5.0.0",
    contractDigest: gtlConformanceCorpusDigest,
    contractKind: "corpus_asset",
    owningProduct: productId,
    requirementAuthorityRefs: [
      "specification/requirements/gtl/REQ-L-GTL3-LAWS.md#REQ-L-GTL3-LAWS-027",
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-007",
    ],
    capabilityIdentities: gtlTypecheckCapabilityIdentities,
    assetLocator: {
      path: gtlConformanceCorpusPath,
      mediaType: "application/json",
      schemaVersion: "5.0.0",
      contentDigest: gtlConformanceCorpusDigest,
      schemaContractId: "abg.schema.gtl-language-conformance-corpus",
      diagnosticVocabularyContractId:
        "abg.vocabulary.gtl-program-diagnostic-id",
    },
  },
];

const rows = [
  ...consensusContractRows,
  ...consensusVocabularyRows,
  ...publicOperationRows,
  ...gtlContractRows,
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
    nativeTypedLocator: nativeTypedLocator(abgNativeInventory, "openCall"),
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
      "proposeJudgment",
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
    capabilityIdentities: gtlAdmitCapabilityIdentities,
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
