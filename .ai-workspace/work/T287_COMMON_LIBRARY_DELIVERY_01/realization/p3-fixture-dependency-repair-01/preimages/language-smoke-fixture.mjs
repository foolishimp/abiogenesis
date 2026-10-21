import { execFile } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { LANGUAGE_TEST_IDS, LANGUAGE_FIXTURE_OWNER, constructLanguageTestPublication } from "../fixtures/language-smoke/program.mjs";
import { LANGUAGE_TEST_DIRECT_IDS, constructLanguageTestInput, evaluateLanguageTestResult } from "../fixtures/language-smoke/program.mjs";
export { LANGUAGE_TEST_IDS, LANGUAGE_TEST_DIRECT_IDS, constructLanguageTestInput, evaluateLanguageTestResult, constructLanguageTestPublication } from "../fixtures/language-smoke/program.mjs";
const execFileAsync = promisify(execFile);
export function languageTestGtlView(gtl) {
  return Object.freeze({ ...gtl, LANGUAGE_TEST_IDS, LANGUAGE_TEST_DIRECT_IDS, constructLanguageTestInput,
    evaluateLanguageTestResult, constructLanguageTestModulePublication: artifact => constructLanguageTestPublication(gtl, artifact) });
}

// This artifact is solely a test-owned container for authored declarations and
// a leaf seam. It is never copied into production, exported by ABG or published.
export async function prepareLanguageSmokeFixture({ scratch, product, gtl, abiPublication }) {
  const owner = LANGUAGE_FIXTURE_OWNER;
  const sourceRoot = join(scratch, "language-smoke-fixture");
  await mkdir(join(sourceRoot, "build"), { recursive: true });
  await mkdir(join(sourceRoot, "contracts/capabilities"), { recursive: true });
  for (const name of ["program.mjs", "leaf.mjs"]) await cp(fileURLToPath(new URL(`../fixtures/language-smoke/${name}`, import.meta.url)), join(sourceRoot, "build", name));
  const payload = { "package.json": { name: owner.packageName, version: owner.packageVersion, type: "module",
    exports: { "./program": "./build/program.mjs" }, files: ["build", "contracts", "product-toolchain-manifest.json"] },
    "contracts/public-contract-catalog.schema.json": { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object" } };
  for (const [path, value] of Object.entries(payload)) await writeFile(join(sourceRoot, path), `${product.canonicalJson(value)}\n`);
  const capabilityGraph = product.constructCapabilityDefinitionGraph([]);
  const graphBytes = product.capabilityDefinitionGraphAssetBytes(capabilityGraph);
  await writeFile(join(sourceRoot, product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH), graphBytes);
  const graphCoordinate = product.capabilityDefinitionGraphCoordinate(capabilityGraph);
  const productRelativeLocators = [...Object.keys(payload), "build/leaf.mjs", "build/program.mjs"].sort();
  const inventory = await Promise.all(productRelativeLocators.map(async path => ({ path, sha256: await product.sha256File(join(sourceRoot, path)) })));
  const productContentDigest = product.payloadInventoryDigest(inventory);
  const placeholder = `sha256:${"0".repeat(64)}`;
  const draft = constructLanguageTestPublication(gtl, { ...owner, productContentDigest, artifactDigest: placeholder, productManifestDigest: placeholder });
  const catalogBody = { schemaVersion: "5.0.0", catalogId: "catalog://abi5-tests/language-fixtures@5",
    catalogVersion: "5.0.0", catalogSchemaPath: "contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest: await product.sha256File(join(sourceRoot, "contracts/public-contract-catalog.schema.json")), rows: [] };
  const publicContractCatalog = { ...catalogBody, catalogDigest: product.sha256Canonical(catalogBody) };
  const provenanceRef = "provenance://abi5-tests/language-fixtures@5";
  const contributionManifest = { kind: "product_contribution_manifest", schemaVersion: "5.0.0",
    contributionManifestRef: draft.contributionManifestRef, productId: owner.productId, productVersion: owner.packageVersion,
    descriptorRef: draft.descriptorRef, productContentDigest, publicContractCatalogId: publicContractCatalog.catalogId,
    publicContractCatalogDigest: publicContractCatalog.catalogDigest, capabilityDefinitionGraph: graphCoordinate,
    publicationBindings: [{ moduleRef: draft.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(draft) }],
    rows: draft.contributions.map(({ provenanceRefs: _refs, ...row }) => ({ moduleRef: draft.moduleRef, ...row, provenanceRef })) };
  const manifest = { kind: "abg_product_toolchain_manifest", schemaVersion: "5.0.0", ...owner, productContentDigest,
    productRelativeLocators, descriptorRef: draft.descriptorRef, publisherNamespace: "abi5-tests",
    contributionManifestRef: draft.contributionManifestRef, contributionManifestDigest: product.sha256Canonical(contributionManifest),
    contributionManifest, compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    declaredDependencies: [{ kind: "requires", productId: abiPublication.owningProductId,
      packageVersion: abiPublication.productSemanticsBinding.packageVersion, compatibilityRef: "compatibility://abiogenesis/major/5",
      requiredContractRefs: ["abg.contract.gtl.root-declaration", "abg.schema.public-operation-invocation"],
      requiredCapabilityRefs: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.gtl.declare@5"] }],
    provenanceRef, declaredCapabilityRefs: [], capabilityDefinitionGraph: { ...graphCoordinate,
      assetLocator: { path: product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH, mediaType: "application/json", schemaVersion: "5.0.0", contentDigest: product.sha256Bytes(graphBytes) } },
    publicContractCatalog };
  await writeFile(join(sourceRoot, "product-toolchain-manifest.json"), `${product.canonicalJson(manifest)}\n`);
  const artifacts = join(sourceRoot, "artifacts"); await mkdir(artifacts);
  const { stdout } = await execFileAsync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts], { cwd: sourceRoot, maxBuffer: 10 * 1024 * 1024 });
  const [packed] = JSON.parse(stdout); const artifactPath = join(artifacts, packed.filename);
  const basis = { ...owner, productContentDigest, artifactDigest: await product.sha256File(artifactPath), manifestDigest: product.sha256Canonical(manifest) };
  return { artifactPath, artifactRef: basename(artifactPath), basis, ids: LANGUAGE_TEST_IDS, sourceRoot, manifest,
    async loadInstalledPublication({ installedRoot, gtl: installedGtl }) {
      const installedProgram = await import(pathToFileURL(join(installedRoot, "build/program.mjs")).href);
      return installedProgram.constructLanguageTestPublication(installedGtl, { ...basis, productManifestDigest: basis.manifestDigest });
    } };
}
