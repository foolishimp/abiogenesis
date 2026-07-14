import {
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { TextEncoder } from "node:util";

import ts from "typescript";

import { RUNTIME_EVENT_KIND_VALUES } from "../../build/semantic/code/src/abg/m03/index.js";
import {
  DS1_BASELINE_SCHEMA_ASSET_REGISTER,
  DS1_NATIVE_CONTRACT_REGISTER,
  DS1_PUBLIC_OPERATION_DEFINITION_REGISTER,
  buildDs1ProductPublication,
  publicContractAssetDigest
} from "../../build/semantic/code/src/app/m04/public_contracts/index.js";
import {
  canonicalizeIJson,
  constructGraph,
  constructGraphFunction,
  constructModule,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs,
  identity,
  serializeModule
} from "../../build/semantic/code/src/index.js";
import { projectPublicOperationSchemaDefinitions } from "./project_public_operation_schemas.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = path.resolve(HERE, "../..");
const PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const MANIFEST_PATH = "product-toolchain-manifest.json";
const CATALOG_PATH = "contracts/public-contract-catalog.json";
const VOCABULARY_ID = "abg.vocabulary.runtime-event-kind";
const VOCABULARY_PATH = "contracts/vocabularies/runtime-event-kind.json";
export const T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE =
  "graph-function://abiogenesis/system/gtl-graph-function-identity/v1";
export const T223_ABG_SYSTEM_MODULE_PATH =
  "contracts/catalog/abiogenesis-system.module.json";
const EXPECTED_PACKAGE_FILES = Object.freeze([
  "build/semantic/**",
  "config/**",
  "contracts/**",
  MANIFEST_PATH
]);

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function productPath(absolutePath) {
  const relative = path.relative(PACKAGE_ROOT, absolutePath);
  if (
    relative.length === 0 ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new TypeError(`path is outside the package root: ${absolutePath}`);
  }
  return relative.split(path.sep).join("/");
}

function absoluteProductPath(relativePath) {
  return path.join(PACKAGE_ROOT, ...relativePath.split("/"));
}

async function walkFiles(relativeRoot, options = {}) {
  const absoluteRoot = absoluteProductPath(relativeRoot);
  let entries;
  try {
    entries = await readdir(absoluteRoot, { withFileTypes: true });
  } catch (error) {
    if (options.optional === true && error?.code === "ENOENT") {
      return [];
    }
    throw error;
  }
  const files = [];
  for (const entry of entries.sort((left, right) =>
    compareText(left.name, right.name)
  )) {
    const absolute = path.join(absoluteRoot, entry.name);
    if (entry.isSymbolicLink()) {
      throw new TypeError(`package payload contains a symbolic link: ${productPath(absolute)}`);
    }
    if (entry.isDirectory()) {
      files.push(...await walkFiles(productPath(absolute), options));
      continue;
    }
    if (!entry.isFile()) {
      throw new TypeError(`package payload contains a non-file entry: ${productPath(absolute)}`);
    }
    files.push(productPath(absolute));
  }
  return files.sort(compareText);
}

async function contractAsset(relativePath) {
  const bytes = new Uint8Array(await readFile(absoluteProductPath(relativePath)));
  return Object.freeze({
    relativePath,
    bytes,
    digest: publicContractAssetDigest(bytes)
  });
}

function expectedSchemaDefinitions() {
  return Object.freeze([
    ...DS1_BASELINE_SCHEMA_ASSET_REGISTER,
    ...projectPublicOperationSchemaDefinitions(
      DS1_PUBLIC_OPERATION_DEFINITION_REGISTER
    )
  ].sort((left, right) => compareText(left.contractId, right.contractId)));
}

export async function loadStaticSchemaAssets() {
  const definitions = expectedSchemaDefinitions();
  const expectedPaths = definitions
    .map((definition) => definition.relativePath)
    .sort(compareText);
  const actualPaths = await walkFiles("contracts/schemas");
  if (canonicalizeIJson(actualPaths) !== canonicalizeIJson(expectedPaths)) {
    const expected = new Set(expectedPaths);
    const actual = new Set(actualPaths);
    const missing = expectedPaths.filter((entry) => !actual.has(entry));
    const unexpected = actualPaths.filter((entry) => !expected.has(entry));
    throw new TypeError(
      `contract schema census mismatch; missing=${JSON.stringify(missing)} unexpected=${JSON.stringify(unexpected)}`
    );
  }
  return Object.freeze(await Promise.all(definitions.map(async (definition) => {
    const bytes = new Uint8Array(
      await readFile(absoluteProductPath(definition.relativePath))
    );
    return Object.freeze({
      contractId: definition.contractId,
      relativePath: definition.relativePath,
      mediaType: "application/schema+json",
      bytes
    });
  })));
}

function runtimeEventVocabularyAsset() {
  const bytes = new TextEncoder().encode(canonicalizeIJson({
    kind: "abg_closed_vocabulary",
    schemaVersion: 1,
    vocabularyId: VOCABULARY_ID,
    values: RUNTIME_EVENT_KIND_VALUES
  }));
  return Object.freeze({
    contractId: VOCABULARY_ID,
    relativePath: VOCABULARY_PATH,
    mediaType: "application/json",
    bytes
  });
}

export function buildAbgSystemCatalogModule() {
  const node = constructNode({
    name: "GtlGraphFunction",
    schema: {
      kind: "symbolic",
      ref: "abg.schema.gtl-graph-function"
    },
    typeRef: null,
    markov: ["catalog:admitted"],
    assetSurface: {
      kind: "gtl_graph_function",
      standardsRefs: [
        "specification/requirements/product/REQ-P-CATALOG.md"
      ],
      outputContractRefs: ["abg.schema.gtl-graph-function"],
      proofObligationRefs: ["proof://t223/abg-system-catalog-identity"]
    },
    tags: ["abiogenesis", "catalog", "identity"],
    id: "node://abiogenesis/system/gtl-graph-function"
  });
  const authored = identity([node], {
    name: T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE,
    tags: ["abiogenesis", "catalog", "identity"]
  });
  if (authored.template.kind !== "inline_graph") {
    throw new TypeError("ABG system identity GraphFunction must have an inline graph");
  }
  const graph = constructGraph({
    ...authored.template.graph,
    id: "graph://abiogenesis/system/gtl-graph-function-identity/v1"
  });
  const graphFunction = constructGraphFunction({
    ...authored,
    template: constructTemplateRef({
      ...authored.template,
      graph
    }),
    id: "graph-function-id://abiogenesis/system/gtl-graph-function-identity/v1"
  });
  return serializeModule(constructModule({
    name: "abiogenesis-system-catalog",
    graphs: [],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  }));
}

function abgSystemCatalogModuleAsset() {
  const bytes = new TextEncoder().encode(
    canonicalizeIJson(buildAbgSystemCatalogModule())
  );
  return Object.freeze({
    relativePath: T223_ABG_SYSTEM_MODULE_PATH,
    bytes,
    digest: publicContractAssetDigest(bytes)
  });
}

async function packageJson() {
  const value = JSON.parse(
    await readFile(absoluteProductPath("package.json"), "utf8")
  );
  if (value.name !== PACKAGE_NAME || typeof value.version !== "string") {
    throw new TypeError("package.json has an unexpected product identity");
  }
  if (canonicalizeIJson(value.files) !== canonicalizeIJson(EXPECTED_PACKAGE_FILES)) {
    throw new TypeError(
      `package.json files must equal ${JSON.stringify(EXPECTED_PACKAGE_FILES)}`
    );
  }
  return value;
}

export async function censusBasePayload() {
  const rootEntries = await readdir(PACKAGE_ROOT, { withFileTypes: true });
  const automaticRootFiles = rootEntries
    .filter((entry) => {
      if (!entry.isFile()) return false;
      const lower = entry.name.toLowerCase();
      return (
        lower === "package.json" ||
        lower.startsWith("readme") ||
        lower.startsWith("license") ||
        lower.startsWith("licence") ||
        lower.startsWith("copying") ||
        lower.startsWith("notice")
      );
    })
    .map((entry) => entry.name)
    .sort(compareText);
  if (
    !automaticRootFiles.includes("README.md") ||
    !automaticRootFiles.includes("package.json")
  ) {
    throw new TypeError("npm automatic payload requires README.md and package.json");
  }
  const relativePaths = [
    ...automaticRootFiles,
    ...await walkFiles("config"),
    ...await walkFiles("build/semantic")
  ];
  const uniquePaths = [...new Set(relativePaths)].sort(compareText);
  if (uniquePaths.length !== relativePaths.length) {
    throw new TypeError("base package payload census contains duplicate paths");
  }
  return Object.freeze(await Promise.all(uniquePaths.map(contractAsset)));
}

function exportTargets(definition, manifest) {
  if (!definition.packageExport.startsWith(`${PACKAGE_NAME}/`)) {
    throw new TypeError(`unsupported package export ${definition.packageExport}`);
  }
  const subpath = `./${definition.packageExport.slice(PACKAGE_NAME.length + 1)}`;
  const target = manifest.exports?.[subpath];
  if (
    target === null ||
    typeof target !== "object" ||
    typeof target.types !== "string" ||
    typeof target.import !== "string"
  ) {
    throw new TypeError(`package export ${subpath} has no exact types/import target`);
  }
  if (!target.types.startsWith("./build/semantic/") || !target.types.endsWith(".d.ts")) {
    throw new TypeError(`package export ${subpath} types target is not emitted declaration truth`);
  }
  return Object.freeze({
    declarationPath: target.types.slice(2),
    runtimePath: target.import.slice(2)
  });
}

function isRelativeModuleSpecifier(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}

function isDeclarationFile(absolutePath) {
  return (
    absolutePath.endsWith(".d.ts") ||
    absolutePath.endsWith(".d.mts") ||
    absolutePath.endsWith(".d.cts")
  );
}

function resolveDeclarationDependency(specifier, containingFile, compilerOptions) {
  const resolved = ts.resolveModuleName(
    specifier,
    containingFile,
    compilerOptions,
    ts.sys
  ).resolvedModule;
  if (resolved === undefined) {
    throw new TypeError(
      `cannot resolve relative declaration dependency ${specifier} from ${productPath(containingFile)}`
    );
  }
  const absolute = path.resolve(resolved.resolvedFileName);
  productPath(absolute);
  if (!isDeclarationFile(absolute)) {
    throw new TypeError(
      `relative declaration dependency did not resolve to emitted declarations: ${productPath(absolute)}`
    );
  }
  return absolute;
}

async function declarationClosure(rootPath, compilerOptions) {
  const root = absoluteProductPath(rootPath);
  const pending = [root];
  const visited = new Set();
  while (pending.length > 0) {
    const absolute = pending.pop();
    if (absolute === undefined || visited.has(absolute)) {
      continue;
    }
    if (!isDeclarationFile(absolute)) {
      throw new TypeError(`native contract root is not a declaration: ${productPath(absolute)}`);
    }
    const source = await readFile(absolute, "utf8");
    visited.add(absolute);
    const preprocessed = ts.preProcessFile(source, true, true);
    for (const imported of preprocessed.importedFiles) {
      if (!isRelativeModuleSpecifier(imported.fileName)) {
        continue;
      }
      pending.push(
        resolveDeclarationDependency(imported.fileName, absolute, compilerOptions)
      );
    }
    for (const referenced of preprocessed.referencedFiles) {
      const dependency = path.resolve(path.dirname(absolute), referenced.fileName);
      productPath(dependency);
      if (!isDeclarationFile(dependency)) {
        throw new TypeError(
          `relative declaration reference is not emitted declaration truth: ${productPath(dependency)}`
        );
      }
      pending.push(dependency);
    }
  }
  return [...visited].map(productPath).sort(compareText);
}

function assertDeclarationProgram(rootPaths, compilerOptions) {
  const program = ts.createProgram({
    rootNames: rootPaths.map(absoluteProductPath),
    options: compilerOptions
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length > 0) {
    throw new TypeError(
      `emitted declaration program is invalid:\n${diagnostics.map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      ).join("\n")}`
    );
  }
}

export async function deriveNativeDeclarationInventories(input) {
  const compilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    skipLibCheck: false
  };
  const roots = DS1_NATIVE_CONTRACT_REGISTER.map((definition) =>
    exportTargets(definition, input.packageManifest).declarationPath
  );
  assertDeclarationProgram(roots, compilerOptions);
  const payloadByPath = new Map(
    input.basePayloadAssets.map((asset) => [asset.relativePath, asset])
  );
  return Object.freeze(await Promise.all(
    DS1_NATIVE_CONTRACT_REGISTER.map(async (definition) => {
      const root = exportTargets(definition, input.packageManifest).declarationPath;
      const closure = await declarationClosure(root, compilerOptions);
      return Object.freeze({
        contractId: definition.contractId,
        rows: Object.freeze(closure.map((declarationPath) => {
          const asset = payloadByPath.get(declarationPath);
          if (asset === undefined) {
            throw new TypeError(
              `${definition.contractId}: declaration closure is outside the payload: ${declarationPath}`
            );
          }
          return Object.freeze({
            packageExport: definition.packageExport,
            declarationPath,
            declarationDigest: asset.digest
          });
        }))
      });
    })
  ));
}

async function publicationRuntimeProfile() {
  const value = JSON.parse(
    await readFile(
      absoluteProductPath("config/publication-runtime-profile.json"),
      "utf8"
    )
  );
  const allowedKeys = [
    "kind",
    "schemaVersion",
    "runtimeIdentity",
    "resolvedPolicy",
    "standardPluginRefs"
  ];
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).sort(compareText).join("\u0000") !==
      [...allowedKeys].sort(compareText).join("\u0000") ||
    value.kind !== "abg_publication_runtime_profile_input" ||
    value.schemaVersion !== 1
  ) {
    throw new TypeError("publication runtime profile is malformed");
  }
  return Object.freeze({
    runtimeIdentity: value.runtimeIdentity,
    resolvedPolicy: value.resolvedPolicy,
    standardPluginRefs: value.standardPluginRefs
  });
}

export async function prepareAbgProductPublication() {
  const manifest = await packageJson();
  const systemCatalogModule = abgSystemCatalogModuleAsset();
  const basePayloadAssets = Object.freeze([
    ...await censusBasePayload(),
    systemCatalogModule
  ]);
  const schemaAssets = await loadStaticSchemaAssets();
  const vocabulary = runtimeEventVocabularyAsset();
  const nativeInventories = await deriveNativeDeclarationInventories({
    packageManifest: manifest,
    basePayloadAssets
  });
  const publication = buildDs1ProductPublication({
    publisher: "abiogenesis",
    packageVersion: manifest.version,
    catalogId: "abg.public-contracts.ds1",
    catalogVersion: manifest.version,
    runtimeSystemProfile: await publicationRuntimeProfile(),
    basePayloadAssets,
    staticContractAssets: Object.freeze([...schemaAssets, vocabulary]),
    nativeInventories
  });
  const vocabularyOutput = Object.freeze({
    relativePath: vocabulary.relativePath,
    bytes: vocabulary.bytes,
    digest: publicContractAssetDigest(vocabulary.bytes)
  });
  const outputs = Object.freeze([
    systemCatalogModule,
    vocabularyOutput,
    ...publication.generatedAssets
  ].sort((left, right) => compareText(left.relativePath, right.relativePath)));
  return Object.freeze({
    packageManifest: manifest,
    basePayloadAssets,
    schemaAssets,
    nativeInventories,
    publication,
    outputs
  });
}

function isOwnedGeneratedPath(relativePath) {
  return (
    relativePath === MANIFEST_PATH ||
    relativePath === CATALOG_PATH ||
    relativePath === VOCABULARY_PATH ||
    relativePath.startsWith("contracts/native/") ||
    relativePath.startsWith("contracts/catalog/") ||
    relativePath.startsWith("contracts/capabilities/") ||
    relativePath.startsWith("contracts/operations/")
  );
}

async function currentGeneratedPaths() {
  const paths = [
    ...await walkFiles("contracts/catalog", { optional: true }),
    ...await walkFiles("contracts/native", { optional: true }),
    ...await walkFiles("contracts/capabilities", { optional: true }),
    ...await walkFiles("contracts/operations", { optional: true }),
    ...await walkFiles("contracts/vocabularies", { optional: true })
  ];
  try {
    await readFile(absoluteProductPath(CATALOG_PATH));
    paths.push(CATALOG_PATH);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  try {
    await readFile(absoluteProductPath(MANIFEST_PATH));
    paths.push(MANIFEST_PATH);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const unexpected = paths.filter((entry) => !isOwnedGeneratedPath(entry));
  if (unexpected.length > 0) {
    throw new TypeError(`generated contract roots contain unowned files: ${unexpected.join(", ")}`);
  }
  return [...new Set(paths)].sort(compareText);
}

export async function writeAbgProductPublication(prepared) {
  const expectedPaths = new Set(prepared.outputs.map((asset) => asset.relativePath));
  for (const currentPath of await currentGeneratedPaths()) {
    if (!expectedPaths.has(currentPath)) {
      await unlink(absoluteProductPath(currentPath));
    }
  }
  for (const asset of prepared.outputs) {
    const absolute = absoluteProductPath(asset.relativePath);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, asset.bytes);
  }
}

export async function checkAbgProductPublication(prepared) {
  const expectedPaths = prepared.outputs.map((asset) => asset.relativePath);
  const actualPaths = await currentGeneratedPaths();
  if (canonicalizeIJson(actualPaths) !== canonicalizeIJson(expectedPaths)) {
    throw new TypeError(
      `generated publication census mismatch; expected=${JSON.stringify(expectedPaths)} actual=${JSON.stringify(actualPaths)}`
    );
  }
  const stale = [];
  for (const asset of prepared.outputs) {
    const actual = await readFile(absoluteProductPath(asset.relativePath));
    if (!actual.equals(asset.bytes)) {
      stale.push(asset.relativePath);
    }
  }
  if (stale.length > 0) {
    throw new TypeError(`generated publication assets are stale: ${stale.join(", ")}`);
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode !== "--write" && mode !== "--check") {
    throw new TypeError("expected --write or --check");
  }
  const prepared = await prepareAbgProductPublication();
  if (mode === "--write") {
    await writeAbgProductPublication(prepared);
  } else {
    await checkAbgProductPublication(prepared);
  }
  process.stdout.write(
    `${mode === "--write" ? "wrote" : "verified"} ${prepared.outputs.length} generated publication assets from ${prepared.publication.productContentInventory.length} immutable payload files\n`
  );
}

if (
  process.argv[1] !== undefined &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  await main();
}
