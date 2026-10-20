import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {cp, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {basename, dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {promisify} from 'node:util';
import test from 'node:test';

const tenant = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const compiled = process.env.ABI207_COMPILED_ROOT ?? join(tenant, 'build/code/src');
const load = (relative) => import(pathToFileURL(join(compiled, relative)).href);
const [verification, environment, installation, capability, digests, canonical] = await Promise.all([
  load('product/verify_product.js'), load('product/environment.js'), load('product/install_product.js'),
  load('shared/capability_contracts.js'), load('shared/digests.js'), load('shared/canonical_json.js'),
]);
const exec = promisify(execFile);
const canonicalJson = canonical.canonicalJson;
const compatibilityRef = 'compatibility://dependency-lock.test/major/5';
const dependencyId = 'product://dependency-lock.test/dependency@5.0.0';
const dependencyName = '@abi207/dependency';

// Author-owned minimal Products have no callable/native contract claims. The
// genuine verifier, lock and install owners establish their complete carriers.
async function packedProduct(scratch, label, {productId, packageName, marker, dependencies = {}, declaredDependencies = [], source}) {
  const root = join(scratch, label, 'source'), artifacts = join(scratch, label, 'artifacts');
  await mkdir(join(root, 'build'), {recursive: true});
  await mkdir(join(root, 'contracts/capabilities'), {recursive: true});
  await mkdir(artifacts, {recursive: true});
  const packageJson = {name: packageName, version: '5.0.0', type: 'module', exports: {'.': './build/index.js'},
    files: ['build', 'contracts', 'product-toolchain-manifest.json'], dependencies};
  await writeFile(join(root, 'package.json'), canonicalJson(packageJson) + '\n');
  await writeFile(join(root, 'build/index.js'), source ?? `export const marker = ${JSON.stringify(marker)};\n`);
  await writeFile(join(root, 'contracts/catalog.json'), '{"type":"object"}\n');
  const productRelativeLocators = ['build/index.js', 'contracts/catalog.json', 'package.json'];
  const productContentDigest = digests.payloadInventoryDigest(await Promise.all(productRelativeLocators.map(async path =>
    ({path, sha256: await digests.sha256File(join(root, path))}))));
  const graph = capability.constructCapabilityDefinitionGraph([]);
  const graphBytes = capability.serializeCapabilityDefinitionGraph(graph);
  await writeFile(join(root, capability.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH), graphBytes);
  const graphCoordinate = {graphId: graph.graphId, graphVersion: graph.graphVersion, graphDigest: graph.graphDigest};
  const catalogBody = {schemaVersion: '5.0.0', catalogId: `catalog://${packageName}/contracts@5`, catalogVersion: '5.0.0',
    catalogSchemaPath: 'contracts/catalog.json', catalogSchemaDigest: await digests.sha256File(join(root, 'contracts/catalog.json')), rows: []};
  const catalog = {...catalogBody, catalogDigest: digests.sha256Canonical(catalogBody)};
  const contribution = {kind: 'product_contribution_manifest', schemaVersion: '5.0.0',
    contributionManifestRef: `contribution-manifest://${packageName}@5`, productId, productVersion: '5.0.0',
    descriptorRef: `descriptor://${packageName}@5`, productContentDigest,
    publicContractCatalogId: catalog.catalogId, publicContractCatalogDigest: catalog.catalogDigest,
    capabilityDefinitionGraph: graphCoordinate, publicationBindings: [], rows: []};
  const manifest = {kind: 'abg_product_toolchain_manifest', schemaVersion: '5.0.0', productId,
    packageName, packageVersion: '5.0.0', productContentDigest, productRelativeLocators,
    descriptorRef: contribution.descriptorRef, publisherNamespace: 'dependency-lock.test',
    contributionManifestRef: contribution.contributionManifestRef,
    contributionManifestDigest: digests.sha256Canonical(contribution), contributionManifest: contribution,
    compatibilityRefs: [compatibilityRef], declaredDependencies,
    provenanceRef: `provenance://${packageName}@5`, declaredCapabilityRefs: [],
    capabilityDefinitionGraph: {...graphCoordinate, assetLocator: {path: capability.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
      mediaType: 'application/json', schemaVersion: '5.0.0', contentDigest: digests.sha256Bytes(graphBytes)}},
    publicContractCatalog: catalog};
  await writeFile(join(root, 'product-toolchain-manifest.json'), canonicalJson(manifest) + '\n');
  const {stdout} = await exec('npm', ['pack', '--ignore-scripts', '--offline', '--json', '--pack-destination', artifacts], {cwd: root});
  const [{filename}] = JSON.parse(stdout), artifactPath = join(artifacts, filename);
  const request = {artifactPath, artifactRef: basename(artifactPath), expectedArtifactDigest: await digests.sha256File(artifactPath),
    expectedProductContentDigest: productContentDigest, expectedManifestDigest: digests.sha256Canonical(manifest),
    expectedProductId: productId, expectedPackageName: packageName, expectedPackageVersion: '5.0.0'};
  const verified = await verification.verifyProduct(request);
  assert.equal(verified.kind, 'verified_product_artifact', JSON.stringify(verified));
  return {root, artifactPath, verified, manifest};
}

const requires = (productId) => ({kind: 'requires', productId, packageVersion: '5.0.0', compatibilityRef,
  requiredContractRefs: [], requiredCapabilityRefs: []});

test('physical managed dependency material must match the selected immutable Product lock', async t => {
  const base = process.env.ABI207_PROOF_ROOT ?? tmpdir();
  await mkdir(base, {recursive: true});
  const scratch = await mkdtemp(join(base, 'installed-dependency-lock-'));
  if (!process.env.ABI207_PROOF_ROOT) t.after(() => rm(scratch, {recursive: true, force: true}));
  const observations = [];
  const old = await packedProduct(scratch, 'old', {productId: dependencyId, packageName: dependencyName, marker: 'old'});
  const current = await packedProduct(scratch, 'current', {productId: dependencyId, packageName: dependencyName, marker: 'current'});
  const crossed = await packedProduct(scratch, 'crossed', {productId: 'product://dependency-lock.test/foreign@5.0.0', packageName: dependencyName, marker: 'foreign'});
  assert.equal(old.verified.packageName, current.verified.packageName);
  assert.equal(old.verified.packageVersion, current.verified.packageVersion);
  assert.notEqual(old.verified.productContentDigest, current.verified.productContentDigest);

  async function installCase(label, physicalArtifact, expectedCode, selectedArtifacts = [current.verified], declared = [requires(dependencyId)]) {
    const fixture = await packedProduct(scratch, label, {productId: `product://dependency-lock.test/${label}@5.0.0`,
      packageName: `@abi207/${label}`, marker: label,
      dependencies: physicalArtifact === null ? {} : {[selectedArtifacts.at(-1).packageName]: `file:${physicalArtifact}`},
      declaredDependencies: declared,
      source: physicalArtifact === null ? undefined : `export {marker} from ${JSON.stringify(selectedArtifacts.at(-1).packageName)};\n`});
    const lock = environment.constructResolvedProductLock([...selectedArtifacts, fixture.verified]);
    assert.equal(lock.kind, 'resolved_product_lock', JSON.stringify(lock));
    const targetRoot = join(scratch, label, 'installed');
    const result = await installation.installProduct({artifactPath: fixture.artifactPath, targetRoot, verifiedArtifact: fixture.verified, resolvedLock: lock});
    if (expectedCode === null) {
      assert.equal(result.kind, 'product_install_candidate', JSON.stringify(result));
      assert.equal(environment.isProductInstallCandidate(result, lock), true);
      assert.equal(await installation.installedProductContentMatches(result), true);
      const imported = await import(pathToFileURL(join(result.installedRoot, 'build/index.js')).href);
      assert.equal(imported.marker, 'current', 'ordinary package-name import consumes the actual selected current dependency');
    } else {
      assert.equal(result.kind, 'product_install_refusal', JSON.stringify(result));
      assert.equal(result.code, expectedCode);
    }
    const actualDependencyRoot = join(targetRoot, 'node_modules', ...dependencyName.split('/'));
    let actualManifest = null;
    try {actualManifest = JSON.parse(await readFile(join(actualDependencyRoot, 'product-toolchain-manifest.json'), 'utf8'));} catch {}
    observations.push({label, artifactPath: fixture.artifactPath, consumer: fixture.verified.productContentDigest,
      lockDigest: lock.lockDigest, expectedDependencyContent: current.verified.productContentDigest,
      actualDependencyContent: actualManifest?.productContentDigest ?? null, kind: result.kind,
      code: result.code ?? null, actualDependencyRoot});
    return {result, actualDependencyRoot};
  }

  await t.test('correct physical dependency succeeds and ordinary import consumes it', () => installCase('correct', current.artifactPath, null));
  await t.test('same-name/version old payload under the current lock refuses', () => installCase('stale', old.artifactPath, 'dependency_lock_mismatch'));
  await t.test('missing managed dependency refuses', () => installCase('missing', null, 'dependency_lock_mismatch'));
  await t.test('crossed Product identity under the selected package name refuses', () => installCase('foreign', crossed.artifactPath, 'dependency_lock_mismatch'));

  await t.test('a matching self-reported manifest cannot hide changed physical payload', async () => {
    const tamperedRoot = join(scratch, 'tampered/source'), artifacts = join(scratch, 'tampered/artifacts');
    await cp(current.root, tamperedRoot, {recursive: true}); await mkdir(artifacts, {recursive: true});
    await writeFile(join(tamperedRoot, 'build/index.js'), 'export const marker = "tampered";\n');
    const {stdout} = await exec('npm', ['pack', '--ignore-scripts', '--offline', '--json', '--pack-destination', artifacts], {cwd: tamperedRoot});
    const [{filename}] = JSON.parse(stdout);
    const {actualDependencyRoot} = await installCase('tampered', join(artifacts, filename), 'dependency_lock_mismatch');
    assert.equal(await digests.sha256File(join(actualDependencyRoot, 'product-toolchain-manifest.json')),
      await digests.sha256File(join(current.root, 'product-toolchain-manifest.json')));
    assert.notEqual(await digests.sha256File(join(actualDependencyRoot, 'build/index.js')),
      await digests.sha256File(join(current.root, 'build/index.js')));
  });

  await t.test('selected transitive managed dependency also requires physical correspondence', async () => {
    const middleId = 'product://dependency-lock.test/middle@5.0.0';
    const middle = await packedProduct(scratch, 'middle', {productId: middleId, packageName: '@abi207/middle',
      dependencies: {[dependencyName]: `file:${old.artifactPath}`}, declaredDependencies: [requires(dependencyId)],
      source: `export {marker} from ${JSON.stringify(dependencyName)};\n`});
    await installCase('transitive', middle.artifactPath, 'dependency_lock_mismatch', [current.verified, middle.verified], [requires(middleId)]);
  });

  await writeFile(join(scratch, 'observations.json'), JSON.stringify({
    status: 'focused physical installer proof', observations,
    limits: 'Minimal author-owned packed Products; no native callable declarations, managed Run/admission, actual Data Mapper or installed source-use credit.'}, null, 2) + '\n');
  console.log(JSON.stringify({proof: 'installed_dependency_lock', scratch, observations, limits: 'No native/source-use/UAT qualification'}));
});
