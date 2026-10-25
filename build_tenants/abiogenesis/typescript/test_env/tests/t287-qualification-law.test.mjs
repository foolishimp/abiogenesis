// Validates: REQ-P-QUAL-057B, REQ-P-QUAL-062, REQ-P-QUAL-064, REQ-P-SELF-CONFORMANCE-001
// Generated definition readiness only: no semantic judgment or gate result.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { isQualificationCoverageCatalog, qualificationCoverageIsPublished } from '../../build/code/src/validator/qualification.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = relative => fs.readFileSync(path.join(root, relative));
const json = relative => JSON.parse(read(relative));
const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const input = json('contracts/qualification/authority-inputs.json');
const definition = json('contracts/qualification/sources/stdo_abiogenesis.json');
const inventory = json('contracts/qualification/coverage.json');
const productRef = 'repo://abiogenesis/specification/PRODUCT.md#';

async function isolatedStager(t) {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'abg-qualification-law-'));
  if (process.env.ABG_QUALIFICATION_RETAIN_TEST_SCRATCH !== '1') t.after(() => fs.rmSync(scratch, { recursive: true, force: true }));
  const tenant = path.join(scratch, 'tenant');
  fs.mkdirSync(path.join(tenant, 'scripts'), { recursive: true });
  fs.copyFileSync(path.join(root, 'package.json'), path.join(tenant, 'package.json'));
  fs.copyFileSync(path.join(root, 'scripts/generate-qualification-rule-catalog.mjs'), path.join(tenant, 'scripts/generate-qualification-rule-catalog.mjs'));
  fs.cpSync(path.join(root, 'build/code'), path.join(tenant, 'build/code'), { recursive: true });
  fs.cpSync(path.join(root, 'node_modules'), path.join(tenant, 'node_modules'), { recursive: true });
  return { tenant, scratch, ...await import(pathToFileURL(path.join(tenant, 'scripts/generate-qualification-rule-catalog.mjs'))) };
}

test('qualification law and every rule span bind the selected frozen source bytes', () => {
  const law = json('contracts/qualification/law-basis.json');
  const catalogBytes = read('contracts/qualification/rule-catalog.json');
  const catalog = JSON.parse(catalogBytes);
  assert.equal(input.method.methodVersion, /^stdo:\/\/releases\/v([^/]+)\/$/.exec(input.method.releaseRef)[1]);
  assert.equal(input.method.releaseRef, definition.constitution.stdo.basis.uri);
  assert.equal(input.method.installedManifestDigest, 'sha256:' + definition.constitution.stdo.basis.manifest_sha256);
  assert.deepEqual(catalog.method, input.method);
  for (const [key, value] of Object.entries(input.method)) assert.equal(law[key], value);
  assert.deepEqual(law.sources, input.sources);
  assert.equal(law.catalog.digest, digest(catalogBytes));
  assert.deepEqual(inventory.lawBasis, { ref: law.lawBasisRef, digest: law.lawBasisDigest });
  const material = new Map(input.sources.map(source => {
    const bytes = read(source.path);
    assert.equal(digest(bytes), source.digest); assert.equal(bytes.length, source.byteCount);
    if (source.ref.startsWith('stdo:')) assert(source.ref.startsWith(input.method.releaseRef));
    return [source.ref, { source, bytes }];
  }));
  assert.equal(input.definitionDigest, material.get('repo://abiogenesis/stdo_abiogenesis.json').source.digest);
  for (const rule of catalog.rules) {
    const { source, bytes } = material.get(rule.sourceRef);
    assert.equal(rule.sourceDigest, source.digest);
    assert.equal(rule.spanDigest, digest(bytes.subarray(rule.startByte, rule.endByte)));
    assert.equal(rule.applicability, 'requires_admitted_judgment');
  }
});

test('coverage declarations preserve retained behavior without execution slots or fabricated results', () => {
  assert(isQualificationCoverageCatalog(inventory)); assert(qualificationCoverageIsPublished(inventory));
  const behaviors = inventory.claims.flatMap(c => c.behaviors);
  for (const behavior of ['traversal/compute/F_D', 'traversal/compute/F_P', 'traversal/structural/edge_program', 'C.retry',
    'ABG5-S01/R10', 'ABG5-S06/complete-selected-contract', 'malformed-GTL', 'malformed-FP']) assert(behaviors.includes(behavior));
  for (const claim of inventory.claims) {
    assert(claim.requirementRefs.length); assert(claim.behaviors.length);
    for (const key of ['ordinal', 'graphFunctionRef', 'implementationRef', 'outputContract', 'mechanism', 'disposition']) assert(!(key in claim));
  }
  const subset=structuredClone(inventory);subset.claims.pop();assert(!qualificationCoverageIsPublished(subset));
});

for (const name of ['retainedRC1', 'selectedRC2']) test(`authority staging and ordinary reproduction bind ${name}'s exact Definition-selected release`, async t => {
  const fixturesPath = process.env.ABG_QUALIFICATION_STAGE_FIXTURES;
  if (fixturesPath === undefined) return t.skip('exact historical/current staging fixtures not supplied');
  const fixture = JSON.parse(fs.readFileSync(fixturesPath))[name];
  const stager = await isolatedStager(t);
  const staged = stager.stageQualificationAuthorities(fixture.sourceRoot, fixture.releaseRoot);
  assert.deepEqual(staged.method, fixture.expectedMethod);
  const definitionBytes = fs.readFileSync(path.join(fixture.sourceRoot, 'stdo_abiogenesis.json'));
  assert.equal(staged.definitionDigest, digest(definitionBytes));
  for (const source of staged.sources) {
    const actual = fs.readFileSync(path.join(stager.tenant, source.path));
    assert.equal(digest(actual), source.digest); assert.equal(actual.length, source.byteCount);
    if (source.ref.startsWith('stdo:')) assert(source.ref.startsWith(fixture.expectedMethod.releaseRef));
  }
  const generated = stager.generateQualificationAssets();
  const catalog = JSON.parse(fs.readFileSync(path.join(stager.tenant, 'contracts/qualification/rule-catalog.json')));
  const law = JSON.parse(fs.readFileSync(path.join(stager.tenant, 'contracts/qualification/law-basis.json')));
  const coverage = JSON.parse(fs.readFileSync(path.join(stager.tenant, 'contracts/qualification/coverage.json')));
  assert.deepEqual(catalog.method, fixture.expectedMethod);
  for (const [key, value] of Object.entries(fixture.expectedMethod)) assert.equal(law[key], value);
  assert.deepEqual(coverage.lawBasis, { ref: law.lawBasisRef, digest: law.lawBasisDigest });
  const sources = new Map(staged.sources.map(source => [source.ref, fs.readFileSync(path.join(stager.tenant, source.path))]));
  for (const rule of catalog.rules) assert.equal(rule.spanDigest, digest(sources.get(rule.sourceRef).subarray(rule.startByte, rule.endByte)));
  const original = new Map(generated.outputs.map(o => [o.path, fs.readFileSync(path.join(stager.tenant, o.path))]));
  assert.deepEqual(stager.generateQualificationAssets(), generated);
  for (const [relative, raw] of original) {
    assert.deepEqual(fs.readFileSync(path.join(stager.tenant, relative)), raw);
    if (fixture.reproductionRoot !== undefined) assert.deepEqual(raw, fs.readFileSync(path.join(fixture.reproductionRoot, relative)));
  }
  if (fixture.reproductionRoot !== undefined) assert.deepEqual(staged, JSON.parse(fs.readFileSync(path.join(fixture.reproductionRoot, 'contracts/qualification/authority-inputs.json'))));
});

test('authority staging refuses wrong manifest and altered selected member before writing', async t => {
  const sourceRoot = process.env.ABG_QUALIFICATION_SOURCE_ROOT;
  const releaseRoot = process.env.ABG_QUALIFICATION_RELEASE_ROOT;
  if (sourceRoot === undefined || releaseRoot === undefined) return t.skip('exact installed source acquisition roots not supplied');
  for (const source of input.sources) {
    const actual = source.ref.startsWith('repo://abiogenesis/')
      ? path.join(sourceRoot, source.ref.slice('repo://abiogenesis/'.length))
      : path.join(releaseRoot, source.ref.slice(input.method.releaseRef.length));
    assert.equal(digest(fs.readFileSync(actual)), source.digest);
  }
  const stager = await isolatedStager(t);
  const scratch = path.join(stager.scratch, 'release'); fs.mkdirSync(scratch);
  const before = read('contracts/qualification/authority-inputs.json');
  fs.writeFileSync(path.join(scratch, 'manifest.json'), '{}');
  assert.throws(() => stager.stageQualificationAuthorities(sourceRoot, scratch), /unselected method basis/);
  const manifest = fs.readFileSync(path.join(releaseRoot, 'manifest.json'));
  assert.equal(digest(manifest), input.method.installedManifestDigest);
  fs.writeFileSync(path.join(scratch, 'manifest.json'), manifest);
  fs.mkdirSync(path.join(scratch, 'standards'));
  fs.writeFileSync(path.join(scratch, 'standards/AXIOMATIC_CALCULUS.md'), 'altered selected authority');
  assert.throws(() => stager.stageQualificationAuthorities(sourceRoot, scratch), /unjoined STDO member standards\/AXIOMATIC_CALCULUS.md/);
  assert(!fs.existsSync(path.join(stager.tenant, 'contracts')));
  assert.deepEqual(read('contracts/qualification/authority-inputs.json'), before);
});

test('authority staging refuses a crossed release identity or member-set even with a matching manifest byte digest', async t => {
  const fixturesPath = process.env.ABG_QUALIFICATION_STAGE_FIXTURES;
  if (fixturesPath === undefined) return t.skip('exact current staging fixture not supplied');
  const fixture = JSON.parse(fs.readFileSync(fixturesPath)).selectedRC2;
  const stager = await isolatedStager(t);
  const source = path.join(stager.scratch, 'source'), release = path.join(stager.scratch, 'release');
  fs.mkdirSync(source); fs.mkdirSync(release);
  const originalDefinition = JSON.parse(fs.readFileSync(path.join(fixture.sourceRoot, 'stdo_abiogenesis.json')));
  const originalManifest = JSON.parse(fs.readFileSync(path.join(fixture.releaseRoot, 'manifest.json')));
  for (const [change, diagnostic] of [[m => { m.release.cut = 'v2.5.1-rc.1'; }, /unselected method basis/],
    [m => { m.standards.member_set_sha256 = '0'.repeat(64); }, /unjoined STDO member set/]]) {
    const manifest = structuredClone(originalManifest); change(manifest);
    const manifestBytes = Buffer.from(JSON.stringify(manifest));
    const definition = structuredClone(originalDefinition);
    definition.constitution.stdo.basis.manifest_sha256 = digest(manifestBytes).slice(7);
    fs.writeFileSync(path.join(source, 'stdo_abiogenesis.json'), JSON.stringify(definition));
    fs.writeFileSync(path.join(release, 'manifest.json'), manifestBytes);
    assert.throws(() => stager.stageQualificationAuthorities(source, release), diagnostic);
    assert(!fs.existsSync(path.join(stager.tenant, 'contracts')));
  }
});

test('leaf admission reads both catalogs once from the owner install and refuses bytes that differ from the recorded digest at authority_verification', async t => {
  const vm = await import('node:vm');
  const built = relative => pathToFileURL(path.join(root, 'build/code/src', relative)).href;
  const { QUALIFICATION_IDS: q } = await import(built('gtl/self_conformance.js'));
  const { readRuntimeFailureDiagnosticSubject } = await import(built('abg/runtime_failure.js'));
  const { sha256Canonical, payloadInventoryDigest } = await import(built('shared/digests.js'));
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'abg-qualification-admission-'));
  t.after(() => fs.rmSync(scratch, { recursive: true, force: true }));
  const coveragePath = 'contracts/qualification/coverage.json', rulesPath = 'contracts/qualification/rule-catalog.json';
  const coverageBytes = read(coveragePath), rulesBytes = read(rulesPath), leafPath = 'leaf/admission-observer.mjs';
  // The fixture leaf records the occurrence it is invoked with and returns one typed F_D failure.
  const leafSource = `import { createHash } from 'node:crypto';
export const seen = [];
export function realizeAdmissionObserver(input, occurrence, resolution, inputDigest) {
  seen.push(occurrence);
  const diagnosticRef = 'diagnostic://abiogenesis/qualification-law/admission-observed@5';
  return { kind: 'leaf_realization_candidate', schemaVersion: '5.0.0', disposition: 'failure', diagnosticRef,
    resultCandidate: { kind: 'self_conformance_failure', schemaVersion: '5.0.0', failureClass: 'admission_observed', diagnosticRef },
    evidenceCandidates: [{ kind: 'deterministic_evidence_candidate', schemaVersion: '5.0.0', implementationRef: resolution.implementationRef,
      inputDigest, outputDigest: 'sha256:' + createHash('sha256').update(diagnosticRef).digest('hex') }] };
}
`;
  // One install: both catalogs and the leaf, a manifest naming them, and the digests a verified install records.
  const install = (name, changed = {}) => {
    const installedRoot = path.join(scratch, name), files = { [coveragePath]: coverageBytes, [rulesPath]: rulesBytes, [leafPath]: Buffer.from(leafSource) };
    for (const [relative, bytes] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(installedRoot, relative)), { recursive: true }); fs.writeFileSync(path.join(installedRoot, relative), bytes);
    }
    const locators = Object.keys(files).sort(), manifest = { kind: 'qualification_law_fixture_manifest', productRelativeLocators: locators };
    fs.writeFileSync(path.join(installedRoot, 'product-toolchain-manifest.json'), JSON.stringify(manifest));
    const productContentDigest = payloadInventoryDigest(locators.map(locator => ({ path: locator, sha256: digest(files[locator]) })));
    for (const [relative, bytes] of Object.entries(changed)) fs.writeFileSync(path.join(installedRoot, relative), bytes);
    return { installId: 'install://qualification-law/' + name, productId: 'product://qualification-law', packageName: '@abiogenesis/qualification-law-fixture',
      packageVersion: '5.0.0', installedRoot, productContentDigest, manifestDigest: sha256Canonical(manifest),
      publicContracts: [{ contractId: 'abg.asset.qualification.rule-catalog',
        assetLocator: { path: rulesPath, mediaType: 'application/json', schemaVersion: '5.0.0', contentDigest: digest(rulesBytes) } }] };
  };
  const publicationDigest = 'sha256:' + 'a'.repeat(64), failureContractRef = 'contract://qualification-law/failure@5';
  const resolutionFor = installed => ({ implementationRef: q.malformedAssessImplementation, implementationBindingRef: 'binding://qualification-law/admission@5',
    implementationOwnerProductId: installed.productId, implementationPublicationDigest: publicationDigest, packageName: installed.packageName,
    packageVersion: installed.packageVersion, modulePath: leafPath, namedSymbol: 'realizeAdmissionObserver', computeRegime: 'F_D',
    inputContractRef: 'contract://qualification-law/input@5', outputContractRef: 'contract://qualification-law/output@5', failureContractRef,
    graphFunctionRef: 'graph-function://qualification-law/admission@5', programLocusRef: 'node://qualification-law/admission' });
  // The actual port, with the prefix-bound install, set, publication digest and consumer admissions supplied.
  const portFor = async installed => {
    const row = resolutionFor(installed), owner = { productId: installed.productId, installId: installed.installId,
      moduleRef: 'module://qualification-law', publicationDigest };
    const publication = { owningProductId: installed.productId, moduleRef: owner.moduleRef, productContentDigest: installed.productContentDigest,
      productManifestDigest: installed.manifestDigest, contracts: [{ contractRef: failureContractRef, contractKind: 'failure', valueKind: 'self_conformance_failure' }],
      implementationBindings: [{ bindingRef: row.implementationBindingRef, implementationRef: row.implementationRef, packageName: row.packageName,
        packageVersion: row.packageVersion, modulePath: row.modulePath, namedSymbol: row.namedSymbol }], graphFunctions: [], closureContracts: [] };
    const closure = { selectedGraphFunctionRef: row.graphFunctionRef, semanticsOwner: { ...owner, declarationRef: 'semantics://qualification-law@5' },
      contractOwners: [{ ...owner, declarationRef: failureContractRef }], graphFunctionOwners: [], closureContractOwners: [],
      implementationBindingOwners: [{ ...owner, declarationRef: row.implementationBindingRef }] };
    const projection = { installId: installed.installId, productContentDigest: installed.productContentDigest, manifestDigest: installed.manifestDigest,
      publicationDigest, bindingRef: closure.semanticsOwner.declarationRef, packageName: installed.packageName, packageVersion: installed.packageVersion };
    const overrides = {
      '../abg/environment_admission.js': { hasAdmittedProductInstall: () => true },
      '../abg/execution_basis.js': { hasAdmittedImplementationSetAtPrefix: () => true },
      '../product/publication.js': { modulePublicationSemanticDigest: () => publicationDigest },
      '../product/semantics.js': { inspectProductLeafSemanticsProjection: () => ({ projection, runtime: { verifyInstalledContent: async () => true,
        validateContractValue: () => true, resolveJudgmentRelation: () => null, validateResultEvidenceLineage: () => true,
        resolveProbabilisticWorkerContracts: () => null } }) },
      '../abg/qualification_proof.js': { projectQualificationConsumer: () => ({ call: { judgmentPredicateRef: 'predicate://qualification-law@5' } }) },
    };
    const file = path.join(root, 'build/code/src/implementation/leaf_invocation_port.js');
    const module = new vm.SourceTextModule(fs.readFileSync(file, 'utf8'), { identifier: file,
      importModuleDynamically: specifier => import(specifier) });
    await module.link(async specifier => {
      const values = { ...await import(specifier.startsWith('node:') ? specifier : pathToFileURL(path.resolve(path.dirname(file), specifier)).href),
        ...overrides[specifier] };
      return new vm.SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); });
    });
    await module.evaluate();
    const port = await module.namespace.constructAdmittedLeafInvocationPort({ prefix: {}, artifactTruth: {},
      implementationSet: { rows: [row], implementationSetRef: 'implementation-set://qualification-law', implementationSetDigest: sha256Canonical({ rows: [row] }) },
      semanticsProjection: projection, executionResolution: { declarationClosure: closure, declarationPublications: [publication], ownerInstalls: [installed] } });
    const value = { kind: 'qualification_law_admission_fixture' };
    const invoke = () => port.invoke({ resolution: row, input: value, inputDigest: sha256Canonical(value), failureContractRef, predecessorPrefix: {},
      occurrence: { cCallRef: 'c-call://qualification-law/admission', runId: 'run://qualification-law', graphCallId: 'graph-call://qualification-law',
        frameId: 'frame://qualification-law', programLocusRef: row.programLocusRef, taskOrdinal: null, attempt: 1, executionAuthority: null } });
    const leaf = () => import(pathToFileURL(path.join(installed.installedRoot, leafPath)).href);
    return { invoke, leaf };
  };

  const intact = await portFor(install('intact'));
  for (let n = 0; n < 2; n++) {
    const closed = await intact.invoke();
    assert.equal(closed.candidate.resultCandidate.failureClass, 'admission_observed', JSON.stringify(closed));
  }
  const { seen } = await intact.leaf();
  assert.equal(seen.length, 2);
  const admitted = seen[0].qualificationCatalogs;
  assert(Object.isFrozen(seen[0]) && Object.isFrozen(admitted));
  assert.equal(seen[1].qualificationCatalogs, admitted, 'one admission read serves every invocation of the port');
  assert.deepEqual(admitted.coverage, inventory);
  assert.equal(admitted.rules.digest, digest(rulesBytes));
  assert.equal(admitted.rules.catalog.catalogRef, JSON.parse(rulesBytes).catalogRef);

  for (const [relative, original] of [[rulesPath, rulesBytes], [coveragePath, coverageBytes]]) {
    const changed = Buffer.concat([Buffer.from(' '), original]), installed = install(path.basename(relative, '.json'), { [relative]: changed });
    const tampered = await portFor(installed), closed = await tampered.invoke();
    assert.equal(closed.computeRegime, 'F_D'); assert.equal(closed.receipt, null);
    assert.equal(closed.candidate.disposition, 'failure', JSON.stringify(closed));
    assert.equal(closed.candidate.resultCandidate.failureClass, 'implementation_exception');
    const subject = readRuntimeFailureDiagnosticSubject(closed.candidate.diagnosticRef);
    assert.equal(subject.diagnosticClassRef, 'diagnostic://abiogenesis/implementation/implementation-exception@5');
    assert.equal(subject.stage, 'authority_verification'); assert.equal(subject.reason, 'thrown'); assert.equal(subject.cause.errorClass, 'TypeError');
    const recorded = relative === rulesPath ? digest(rulesBytes) : installed.productContentDigest;
    for (const named of [relative, digest(changed), recorded]) assert(subject.cause.message.includes(named), subject.cause.message);
    assert.equal((await tampered.leaf()).seen.length, 0, 'the implementation is not loaded or invoked');
  }
});
