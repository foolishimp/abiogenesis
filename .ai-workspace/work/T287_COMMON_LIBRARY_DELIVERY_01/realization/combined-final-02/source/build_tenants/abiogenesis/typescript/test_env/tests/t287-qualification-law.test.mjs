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
