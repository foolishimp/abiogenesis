// Validates: REQ-P-QUAL-057B, REQ-P-QUAL-062, REQ-P-QUAL-064, REQ-P-SELF-CONFORMANCE-001
// Generated definition readiness only: no semantic judgment or gate result.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { stageQualificationAuthorities } from '../../scripts/generate-qualification-rule-catalog.mjs';
import { isQualificationCoverageCatalog, qualificationCoverageIsPublished } from '../../build/code/src/validator/qualification.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = relative => fs.readFileSync(path.join(root, relative));
const json = relative => JSON.parse(read(relative));
const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const input = json('contracts/qualification/authority-inputs.json');
const definition = json('contracts/qualification/sources/stdo_abiogenesis.json');
const inventory = json('contracts/qualification/coverage.json');
const productRef = 'repo://abiogenesis/specification/PRODUCT.md#';

test('qualification law and every rule span bind the selected RC1 source bytes', () => {
  const law = json('contracts/qualification/law-basis.json');
  const catalogBytes = read('contracts/qualification/rule-catalog.json');
  const catalog = JSON.parse(catalogBytes);
  assert.equal(input.method.releaseRef, 'stdo://releases/v2.5.1-rc.1/');
  assert.equal(input.method.methodVersion, '2.5.1-rc.1');
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

test('authority staging refuses wrong manifest and altered selected member before writing', t => {
  const sourceRoot = process.env.ABG_QUALIFICATION_SOURCE_ROOT;
  const releaseRoot = process.env.ABG_QUALIFICATION_RELEASE_ROOT;
  if (sourceRoot === undefined || releaseRoot === undefined) return t.skip('exact installed source acquisition roots not supplied');
  for (const source of input.sources) {
    const actual = source.ref.startsWith('repo://abiogenesis/')
      ? path.join(sourceRoot, source.ref.slice('repo://abiogenesis/'.length))
      : path.join(releaseRoot, source.ref.slice(input.method.releaseRef.length));
    assert.equal(digest(fs.readFileSync(actual)), source.digest);
  }
  const scratchRoot = path.join(root, '.self-check'); fs.mkdirSync(scratchRoot, { recursive: true });
  const scratch = fs.mkdtempSync(path.join(scratchRoot, 'qualification-law-'));
  t.after(() => fs.rmSync(scratch, { recursive: true, force: true }));
  const before = read('contracts/qualification/authority-inputs.json');
  fs.writeFileSync(path.join(scratch, 'manifest.json'), '{}');
  assert.throws(() => stageQualificationAuthorities(sourceRoot, scratch), /unselected method basis/);
  const manifest = fs.readFileSync(path.join(releaseRoot, 'manifest.json'));
  assert.equal(digest(manifest), input.method.installedManifestDigest);
  fs.writeFileSync(path.join(scratch, 'manifest.json'), manifest);
  fs.mkdirSync(path.join(scratch, 'standards'));
  fs.writeFileSync(path.join(scratch, 'standards/AXIOMATIC_CALCULUS.md'), 'altered selected authority');
  assert.throws(() => stageQualificationAuthorities(sourceRoot, scratch), /unjoined STDO member standards\/AXIOMATIC_CALCULUS.md/);
  assert.deepEqual(read('contracts/qualification/authority-inputs.json'), before);
});
