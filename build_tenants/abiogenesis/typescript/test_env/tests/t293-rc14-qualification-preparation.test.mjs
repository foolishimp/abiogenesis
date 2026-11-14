// T-293 / RC14 qualification preparation: the existing preparation tools construct one exact canonical candidate
// identity and an explicit existing subject kind (D4/D5 "RC14 exact candidate preparation and native auxiliary
// inputs"; D6 section 2). The joins and refusals are the preparation tools' own
// (test_env/support/exact-candidate-identity.mjs, build-resources.mjs, exact-candidate-qualification.mjs); the
// basis identity, schema and readiness come from the built tenant's own exports, read through the export guard.
// Supplied coordinates are fixtures, labelled as such: no provider, install, archive, AF22 verdict, qualification
// or release claim is produced or implied.
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installedExports, tenantManifest } from '../qualification/build-resources.mjs';
import { CandidateIdentityRefusal, PACKAGE_NAME, RELEASE_CLAIM_PATH, RELEASE_FIELDS, SUBJECT_KINDS, archiveNameOf, claimRefPrefix,
  deriveCandidateIdentity, generatedResourceFailures, installedPackageIdentity, parseCanonicalRcVersion, prepareCandidateIdentity,
  prospectiveRelease, qualificationBasisBody, resourceIndexIdentity, retainedSubjectKind, selectSubjectKind } from '../support/exact-candidate-identity.mjs';

const TENANT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const runtime = await installedExports(TENANT);
const { constructQualificationIdentity, EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA: BASIS_SCHEMA } = runtime.preparation;
const ready = runtime.deep.qualification.isQualificationBasisReady;
const hash = runtime.product.sha256Canonical, v = runtime.valibot;
const MEMBER_PREFIX = 'repo://abiogenesis/build_tenants/abiogenesis/typescript/';
const CLAIM_REF = MEMBER_PREFIX + RELEASE_CLAIM_PATH, CLAIM_PATH = 'build_tenants/abiogenesis/typescript/' + RELEASE_CLAIM_PATH;
const bytesDigest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const label = text => bytesDigest(Buffer.from(text, 'utf8'));
const scratch = await realpath(await mkdtemp(join(tmpdir(), 'abi5-rc14-preparation-')));
after(() => rm(scratch, { recursive: true, force: true }));

const refusal = reason => error => {
  assert.ok(error instanceof CandidateIdentityRefusal, String(error?.stack ?? error));
  assert.equal(error.reason, reason, error.message);
  return true;
};
const claimText = (version, extra = '') => Buffer.from(`# ABIogenesis ${version} candidate\n\n${extra}` +
  `Package: \`${PACKAGE_NAME}\` \`${version}\`, private.\nProduct: \`product://abiogenesis/typescript-tenant@${version}\`.\n`, 'utf8');

/** Fixture joins of one candidate version: package, manifest (the actual one when supplied), verified artifact, install, claim. */
function candidate(version, { claim = claimText(version), manifest = null } = {}) {
  const productId = 'product://abiogenesis/typescript-tenant@' + version;
  const product = manifest ?? { kind: 'abg_product_toolchain_manifest', schemaVersion: '5.0.0', productId, packageName: PACKAGE_NAME,
    packageVersion: version, productContentDigest: label('content ' + version), publisherNamespace: 'abiogenesis' };
  const manifestDigest = hash(product), artifactDigest = label('artifact ' + version), capabilityId = 'abg.capability.gtl.declare@5';
  const verified = { kind: 'verified_product_artifact', artifactRef: `file:///fixture/${'abiogenesis-typescript-tenant-' + version}.tgz`, artifactDigest,
    productId: product.productId, packageName: PACKAGE_NAME, packageVersion: version, productContentDigest: product.productContentDigest, manifestDigest };
  const install = { kind: 'product_install', installId: 'installed-product://abiogenesis/fixture/' + version, productId: product.productId,
    packageName: PACKAGE_NAME, packageVersion: version, artifactDigest, manifestDigest, productContentDigest: product.productContentDigest,
    catalogId: 'catalog://abiogenesis/typescript-tenant/public-contracts@' + version, catalogDigest: label('catalog ' + version),
    capabilityDefinitionGraph: { graphId: 'capability-graph://abiogenesis/fixture', graphDigest: label('graph'),
      rows: [{ capabilityId, boundedProofRefs: ['proof://abiogenesis/fixture/declare'] }] },
    publicContracts: [{ contractId: 'contract://abiogenesis/fixture/declare', owningProduct: product.productId, capabilityIdentities: [capabilityId] }] };
  return { packageJson: { name: PACKAGE_NAME, version }, sourcePackageJson: { name: PACKAGE_NAME, version }, manifest: product, manifestDigest,
    verified, install, releaseClaim: { ref: CLAIM_REF, bytes: claim } };
}

const LAW = { lawBasis: { ref: 'qualification-law://abiogenesis/fixture', digest: label('law') },
  coverageCatalog: { ref: 'qualification-coverage://abiogenesis/fixture', digest: label('coverage') } };
const BINDING = { ref: 'workspace-binding://abiogenesis/fixture', digest: label('binding') };
const inventoryWith = claim => constructQualificationIdentity({ kind: 'qualification_subject_inventory',
  members: [{ ref: claim.ref, path: CLAIM_PATH, digest: claim.digest, byteCount: claim.byteCount }] },
  'inventoryRef', 'inventoryDigest', 'qualification-inventory://abiogenesis/');
/**
 * The existing basis over one identity, through the preparation body and the installed identity constructor. The
 * tenant manifest defaults to the one of this candidate's install; a substituted install supplies it explicitly so
 * the refusal observed is the preparation join's own.
 */
function basisOf(c, identity, subjectKind, { inventory = inventoryWith(identity.releaseClaim), tenant = tenantManifest(runtime, c.install, identity) } = {}) {
  return constructQualificationIdentity(qualificationBasisBody({ subjectKind, identity, install: c.install, verified: c.verified, inventory,
    binding: BINDING, tenant, law: LAW, installedProductDigest: hash(c.install) }),
  'basisRef', 'basisDigest', 'qualification-basis://abiogenesis/');
}
/** The committed generated resources as the regeneration tool writes them for one identity. */
function committedFor(c, identity) {
  const archive = { name: archiveNameOf(identity), digest: identity.artifactDigest }, sourceCommit = 'f'.repeat(40);
  const indexed = resourceIndexIdentity(identity, { candidateCommit: sourceCommit, archive, claimPath: CLAIM_PATH });
  return { resources: { kind: 'qualification_resource_index', schemaVersion: '1', subject: indexed.subject, prospectiveRelease: indexed.prospectiveRelease,
      generator: { path: 'test_env/qualification/build-resources.mjs', package: indexed.generatorPackage } },
    tenantManifest: tenantManifest(runtime, c.install, identity),
    expectedOutputs: { kind: 'qualification_expected_output_inventory', source: { archive: archive.name, archiveDigest: archive.digest, sourceCommit } } };
}
function assertReadyBasis(basis, identity, subjectKind) {
  assert.doesNotThrow(() => v.parse(BASIS_SCHEMA, basis), 'the existing basis schema admits it');
  assert.equal(ready(basis), true, 'the installed readiness law admits it');
  assert.equal(basis.subjectKind, subjectKind);
  assert.equal(basis.productVersion, identity.version);
  assert.deepEqual(basis.prospectiveRelease, { productId: identity.productId, ...RELEASE_FIELDS, ordinal: identity.ordinal, version: identity.version,
    releaseClaim: { ref: identity.releaseClaim.ref, digest: identity.releaseClaim.digest } });
}

test('canonical positive RC identities derive from exact candidate joins', async () => {
  // The actual candidate: the export guard over the built package, its generated manifest and the frozen claim bytes.
  const packageJson = JSON.parse(await readFile(join(TENANT, 'package.json'), 'utf8'));
  const sourceVersion = parseCanonicalRcVersion(packageJson.version);
  assert.deepEqual({ ...installedPackageIdentity(runtime.packageJson) }, { name: PACKAGE_NAME, ...sourceVersion }, 'export guard over the actual package');
  const manifest = JSON.parse(await readFile(join(TENANT, 'product-toolchain-manifest.json'), 'utf8'));
  const claim = await readFile(join(TENANT, RELEASE_CLAIM_PATH));
  const actual = candidate(packageJson.version, { claim, manifest });
  const actualIdentity = deriveCandidateIdentity(actual);
  assert.equal(actualIdentity.version, packageJson.version);
  assert.equal(actualIdentity.ordinal, sourceVersion.ordinal);
  assert.equal(actualIdentity.productId, manifest.productId);
  assert.equal(actualIdentity.manifestDigest, hash(manifest));
  assert.deepEqual({ ...actualIdentity.releaseClaim }, { ref: CLAIM_REF, digest: bytesDigest(claim), byteCount: claim.length });
  assertReadyBasis(basisOf(actual, actualIdentity, 'pre_rc_candidate'), actualIdentity, 'pre_rc_candidate');

  // RC14 and another ordinal: identity, basis, claim refs and generated resource identity all carry the one ordinal.
  const identities = [];
  for (const [version, ordinal] of [['5.0.0-rc.14', 14], ['5.0.0-rc.3', 3]]) {
    const c = candidate(version), identity = deriveCandidateIdentity(c);
    identities.push(identity);
    assert.ok(Object.isFrozen(identity) && Object.isFrozen(identity.releaseClaim), 'the identity is immutable');
    assert.deepEqual({ productId: identity.productId, version: identity.version, ordinal: identity.ordinal, namespace: identity.namespace,
      profile: identity.profile, projectSubtree: identity.projectSubtree, versionLine: identity.versionLine },
    { productId: 'product://abiogenesis/typescript-tenant@' + version, version, ordinal, ...RELEASE_FIELDS });
    assert.equal(identity.artifactDigest, c.verified.artifactDigest);
    assert.equal(identity.installId, c.install.installId);
    assert.deepEqual(prospectiveRelease(identity), { productId: identity.productId, ...RELEASE_FIELDS, ordinal, version,
      releaseClaim: { ref: CLAIM_REF, digest: bytesDigest(c.releaseClaim.bytes) } });
    assertReadyBasis(basisOf(c, identity, 'pre_rc_candidate'), identity, 'pre_rc_candidate');
    const tenant = tenantManifest(runtime, c.install, identity);
    assert.equal(tenant.productId, identity.productId);
    assert.deepEqual(tenant.claims.map(row => row.claimRef), [claimRefPrefix(identity) + 'abg.capability.gtl.declare@5']);
    assert.equal(archiveNameOf(identity), `abiogenesis-typescript-tenant-${version}.tgz`);
    assert.deepEqual(generatedResourceFailures(identity, committedFor(c, identity)), [], 'freshly generated resources belong to the identity');
    assert.equal(prepareCandidateIdentity({ ...c, committed: committedFor(c, identity) }).version, version);
  }
  assert.notEqual(identities[0].productId, identities[1].productId);
  assert.throws(() => tenantManifest(runtime, candidate('5.0.0-rc.14').install, identities[1]), /candidate identity of this install/,
    'a claim ref cannot be minted for an install of another identity');
});

test('malformed and noncanonical RC identities refuse', async () => {
  const malformed = ['5.0.0-rc.0', '5.0.0-rc.00', '5.0.0-rc.014', '5.0.0-rc.-1', '5.0.0-rc.+1', '5.0.0-rc.1.0', '5.0.0-rc.', '5.0.0-rc',
    '5.0.0', '5.0.1-rc.1', '4.9.0-rc.1', '5.0.0-beta.1', '5.0.0-RC.1', 'v5.0.0-rc.1', ' 5.0.0-rc.1', '5.0.0-rc.1 ', '5.0.0-rc.1\n',
    '5.0.0-rc.1e3', '5.0.0-rc.0x1', '5.0.0-rc.１', '5.0.0-rc.9007199254740993', '5.0.0-dev.286', 14, null, undefined, {}];
  for (const version of malformed) {
    assert.throws(() => parseCanonicalRcVersion(version), refusal('noncanonical_version'), String(version));
    const c = candidate('5.0.0-rc.14');
    c.packageJson = { ...c.packageJson, version };
    assert.throws(() => deriveCandidateIdentity(c), refusal('noncanonical_version'), String(version));
  }
  // The export guard refuses before importing any export of a disposable package.
  for (const [packageJson, reason] of [[{ name: PACKAGE_NAME, version: '5.0.0-rc.01' }, 'noncanonical_version'],
    [{ name: PACKAGE_NAME, version: '5.0.0-rc.0' }, 'noncanonical_version'], [{ name: PACKAGE_NAME, version: '5.0.0' }, 'noncanonical_version'],
    [{ name: '@abiogenesis/other', version: '5.0.0-rc.14' }, 'package_mismatch']]) {
    const root = join(scratch, 'export-guard-' + reason + '-' + String(packageJson.version).replaceAll('.', '_'));
    await mkdir(root, { recursive: true });
    await writeFile(join(root, 'package.json'), JSON.stringify({ ...packageJson, type: 'module', exports: {} }) + '\n', { flag: 'wx' });
    await assert.rejects(installedExports(root), refusal(reason), JSON.stringify(packageJson));
  }
  // The preparation refusal agrees with the existing owner law: the schema refuses ordinal 0 and readiness a
  // version that is not the canonical spelling of its ordinal.
  const c = candidate('5.0.0-rc.14'), identity = deriveCandidateIdentity(c), good = basisOf(c, identity, 'pre_rc_candidate');
  const relabel = (fields) => { const { basisRef: _r, basisDigest: _d, ...body } = good;
    return constructQualificationIdentity({ ...body, productVersion: fields.version, prospectiveRelease: { ...body.prospectiveRelease, ...fields } },
      'basisRef', 'basisDigest', 'qualification-basis://abiogenesis/'); };
  assert.equal(ready(relabel({ ordinal: 14, version: '5.0.0-rc.014' })), false, 'readiness refuses a noncanonical spelling');
  assert.equal(ready(relabel({ ordinal: 13, version: '5.0.0-rc.14' })), false, 'readiness refuses a crossed ordinal');
  assert.equal(v.is(BASIS_SCHEMA, relabel({ ordinal: 0, version: '5.0.0-rc.0' })), false, 'the schema refuses ordinal 0');
});

test('candidate package manifest artifact content and claim mismatches refuse', () => {
  const version = '5.0.0-rc.14', previous = '5.0.0-rc.13', other = 'product://abiogenesis/typescript-tenant@' + previous;
  assert.equal(deriveCandidateIdentity(candidate(version)).version, version, 'positive control');
  assert.equal(deriveCandidateIdentity({ ...candidate(version), verified: null }).version, version, 'explicitly absent verification joins the install only');
  const remanifest = (c, change) => { c.manifest = { ...c.manifest, ...change }; c.manifestDigest = hash(c.manifest); };
  const cases = [
    ['installed package name', c => { c.packageJson = { ...c.packageJson, name: '@abiogenesis/other' }; }, 'package_mismatch'],
    ['frozen source package of the previous RC', c => { c.sourcePackageJson = { ...c.sourcePackageJson, version: previous }; }, 'package_mismatch'],
    ['frozen source package of another name', c => { c.sourcePackageJson = { ...c.sourcePackageJson, name: 'typescript-tenant' }; }, 'package_mismatch'],
    ['manifest package version', c => remanifest(c, { packageVersion: previous }), 'manifest_mismatch'],
    ['manifest Product', c => remanifest(c, { productId: other }), 'manifest_mismatch'],
    ['manifest package name', c => remanifest(c, { packageName: '@abiogenesis/other' }), 'manifest_mismatch'],
    ['manifest kind', c => remanifest(c, { kind: 'abg_product_manifest' }), 'manifest_mismatch'],
    ['manifest content digest', c => remanifest(c, { productContentDigest: 'sha256:short' }), 'manifest_mismatch'],
    ['manifest digest of other bytes', c => { c.manifestDigest = label('another manifest'); }, 'artifact_mismatch'],
    ['verified artifact of another Product', c => { c.verified = { ...c.verified, productId: other }; }, 'artifact_mismatch'],
    ['verified artifact of another version', c => { c.verified = { ...c.verified, packageVersion: previous }; }, 'artifact_mismatch'],
    ['verified artifact of another package', c => { c.verified = { ...c.verified, packageName: '@abiogenesis/other' }; }, 'artifact_mismatch'],
    ['verified content', c => { c.verified = { ...c.verified, productContentDigest: label('other content') }; }, 'artifact_mismatch'],
    ['verified artifact without a digest', c => { c.verified = { ...c.verified, artifactDigest: 'sha256:' }; }, 'artifact_mismatch'],
    ['verification neither supplied nor explicitly absent', c => { delete c.verified; }, 'artifact_mismatch'],
    ['install of another artifact', c => { c.install = { ...c.install, artifactDigest: label('other artifact') }; }, 'install_mismatch'],
    ['install of the previous RC', c => { c.install = { ...c.install, packageVersion: previous }; }, 'install_mismatch'],
    ['install of another Product', c => { c.install = { ...c.install, productId: other }; }, 'install_mismatch'],
    ['install of another package', c => { c.install = { ...c.install, packageName: '@abiogenesis/other' }; }, 'install_mismatch'],
    ['install with another manifest', c => { c.install = { ...c.install, manifestDigest: label('other manifest') }; }, 'install_mismatch'],
    ['install with other content', c => { c.install = { ...c.install, productContentDigest: label('other content') }; }, 'install_mismatch'],
    ['install without identity', c => { c.install = { ...c.install, installId: '' }; }, 'install_mismatch'],
    ['no admitted install', c => { c.install = null; }, 'install_mismatch'],
    ['release claim of the previous RC', c => { c.releaseClaim = { ...c.releaseClaim, bytes: claimText(previous) }; }, 'release_claim_mismatch'],
    ['release claim naming the RC1 Product', c => { c.releaseClaim = { ...c.releaseClaim, bytes: Buffer.from(claimText(version).toString('utf8')
      .replace(`typescript-tenant@${version}`, 'typescript-tenant@5.0.0-rc.1')) }; }, 'release_claim_mismatch'],
    ['release claim declaring the identity twice', c => { c.releaseClaim = { ...c.releaseClaim, bytes: Buffer.concat([claimText(version), claimText(version)]) }; }, 'release_claim_mismatch'],
    ['release claim without its Product line', c => { c.releaseClaim = { ...c.releaseClaim, bytes: Buffer.from(claimText(version).toString('utf8').replace(/^Product:.*$/mu, '')) }; }, 'release_claim_mismatch'],
    ['release claim bytes that are not UTF-8', c => { c.releaseClaim = { ...c.releaseClaim, bytes: Buffer.concat([claimText(version), Buffer.from([0xff, 0xfe])]) }; }, 'release_claim_mismatch'],
    ['empty release claim', c => { c.releaseClaim = { ...c.releaseClaim, bytes: Buffer.alloc(0) }; }, 'release_claim_mismatch'],
    ['release claim of another member', c => { c.releaseClaim = { ...c.releaseClaim, ref: MEMBER_PREFIX + 'README.md' }; }, 'release_claim_mismatch'],
  ];
  for (const [name, mutate, reason] of cases) {
    const c = candidate(version);
    mutate(c);
    assert.throws(() => deriveCandidateIdentity(c), refusal(reason), name);
  }
  // The basis joins the identity to the same install, verified artifact and inventory claim member.
  const c = candidate(version), identity = deriveCandidateIdentity(c), elsewhere = candidate('5.0.0-rc.3');
  const tenant = tenantManifest(runtime, c.install, identity);
  assert.throws(() => basisOf({ ...c, install: elsewhere.install }, identity, 'pre_rc_candidate', { tenant }), refusal('install_mismatch'),
    'install of another candidate');
  assert.throws(() => basisOf({ ...c, install: { ...c.install, installId: 'installed-product://abiogenesis/fixture/other' } }, identity, 'pre_rc_candidate'),
    refusal('install_mismatch'), 'another install of the same archive');
  assert.throws(() => basisOf({ ...c, verified: { ...c.verified, artifactDigest: label('substituted') } }, identity, 'pre_rc_candidate'),
    refusal('install_mismatch'), 'substituted verified artifact');
  assert.throws(() => basisOf({ ...c, verified: null }, identity, 'pre_rc_candidate'), refusal('install_mismatch'), 'basis without verification');
  assert.throws(() => basisOf(c, identity, 'pre_rc_candidate', { inventory: inventoryWith({ ...identity.releaseClaim, digest: label('edited claim') }) }),
    refusal('release_claim_stale'), 'inventory claim member of other bytes');
});

test('changed release claims change the exact preparation basis', () => {
  const version = '5.0.0-rc.14';
  const a = candidate(version), b = candidate(version, { claim: claimText(version, 'Known limitation: one further frozen sentence.\n\n') });
  const ia = deriveCandidateIdentity(a), ib = deriveCandidateIdentity(b);
  assert.notEqual(ia.releaseClaim.digest, ib.releaseClaim.digest);
  assert.notEqual(ia.releaseClaim.byteCount, ib.releaseClaim.byteCount);
  const { releaseClaim: _a, ...restA } = ia, { releaseClaim: _b, ...restB } = ib;
  assert.deepEqual(restA, restB, 'only the claim coordinate differs');
  for (const kind of SUBJECT_KINDS) {
    const ba = basisOf(a, ia, kind), bb = basisOf(b, ib, kind);
    assertReadyBasis(ba, ia, kind); assertReadyBasis(bb, ib, kind);
    assert.notEqual(ba.basisDigest, bb.basisDigest, kind + ': the claim bytes are part of the exact basis');
    assert.deepEqual(bb.prospectiveRelease.releaseClaim, { ref: CLAIM_REF, digest: ib.releaseClaim.digest });
    const strip = ({ basisRef: _r, basisDigest: _d, sourceInventory: _s, prospectiveRelease: _p, ...rest }) => rest;
    assert.deepEqual(strip(ba), strip(bb), kind + ': no other coordinate moves');
  }
  assert.throws(() => basisOf(b, ib, 'pre_rc_candidate', { inventory: inventoryWith(ia.releaseClaim) }), refusal('release_claim_stale'),
    'a changed claim cannot reuse the inventory of the earlier claim');
  const earlier = committedFor(a, ia);
  assert.deepEqual(generatedResourceFailures(ia, earlier), []);
  const stale = generatedResourceFailures(ib, earlier);
  assert.ok(stale.some(row => /release claim digest/.test(row)) && stale.some(row => /release claim byteCount/.test(row)), stale.join('; '));
  assert.throws(() => prepareCandidateIdentity({ ...b, committed: earlier }), refusal('stale_resources'), 'resources of the earlier claim are stale');
});

test('subject kind is explicit distinct and preserved at reopening', async () => {
  const c = candidate('5.0.0-rc.14'), identity = deriveCandidateIdentity(c);
  for (const kind of [undefined, null, '', 'pre_rc', 'installed', 'final', 'tapped_release', 'published_rc', 'PRE_RC_CANDIDATE', ['pre_rc_candidate']]) {
    assert.throws(() => selectSubjectKind(kind), refusal('subject_kind_unselected'), String(kind));
    assert.throws(() => basisOf(c, identity, kind), refusal('subject_kind_unselected'), 'no hidden kind default: ' + String(kind));
  }
  assert.deepEqual([...SUBJECT_KINDS], ['pre_rc_candidate', 'installed_rc']);
  const bases = Object.fromEntries(SUBJECT_KINDS.map(kind => [kind, basisOf(c, identity, selectSubjectKind(kind))]));
  for (const kind of SUBJECT_KINDS) assertReadyBasis(bases[kind], identity, kind);
  assert.notEqual(bases.pre_rc_candidate.basisDigest, bases.installed_rc.basisDigest, 'two distinct exact bases over one identity');
  assert.deepEqual(bases.pre_rc_candidate.prospectiveRelease, bases.installed_rc.prospectiveRelease);

  for (const kind of SUBJECT_KINDS) {
    const prepared = { kind: 'qualification_prepare_record', subjectKind: kind, basis: { ref: bases[kind].basisRef, digest: bases[kind].basisDigest } };
    assert.equal(retainedSubjectKind(prepared), kind);
    assert.equal(retainedSubjectKind(prepared, kind), kind);
    const reopened = basisOf(c, identity, retainedSubjectKind(prepared, kind));
    assert.equal(reopened.basisDigest, prepared.basis.digest, kind + ': reopening reconstructs the prepared basis');
    const otherKind = SUBJECT_KINDS.find(value => value !== kind);
    assert.throws(() => retainedSubjectKind(prepared, otherKind), refusal('subject_kind_relabel'), kind + ' cannot be relabelled');
    assert.notEqual(basisOf(c, identity, otherKind).basisDigest, prepared.basis.digest, 'a relabelled basis is a different subject');
  }
  assert.throws(() => retainedSubjectKind({ kind: 'qualification_prepare_record', basis: { ref: 'x', digest: label('x') } }), refusal('subject_kind_not_retained'),
    'an archive prepared without a selection has no default kind');
  assert.throws(() => retainedSubjectKind({ subjectKind: 'final' }, 'final'), refusal('subject_kind_not_retained'));

  // The preparation driver's own command line: a new preparation must select a kind; a reopening mode cannot carry one.
  const driver = await realpath(join(TENANT, 'test_env/support/exact-candidate-qualification.mjs'));
  const archives = join(TENANT, 'test_env/test_runs/qualification');
  const listing = async () => { try { return (await readdir(archives)).sort(); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } };
  const before = await listing(), absentConfig = join(scratch, 'absent-config.json');
  for (const [args, pattern] of [
    [['prepare', '--config', absentConfig, '--dependencies', scratch], /subject_kind_unselected/],
    [['prepare', '--config', absentConfig, '--dependencies', scratch, '--subject-kind', 'final'], /subject_kind_unselected/],
    [['cold-reads', '--config', absentConfig, '--archive', scratch, '--subject-kind', 'installed_rc'], /retained from the prepared archive/],
  ]) {
    const result = spawnSync(process.execPath, [driver, ...args], { cwd: TENANT, encoding: 'utf8', timeout: 120000,
      env: { PATH: process.env.PATH ?? '/usr/bin:/bin', HOME: process.env.HOME ?? scratch, TMPDIR: scratch } });
    assert.equal(result.error, undefined, String(result.error));
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, pattern, args.join(' '));
  }
  assert.deepEqual(await listing(), before, 'the refusals precede every archive');
});

test('stale resources refuse before qualification preparation', () => {
  const version = '5.0.0-rc.14', c = candidate(version), identity = deriveCandidateIdentity(c), committed = committedFor(c, identity);
  assert.deepEqual(generatedResourceFailures(identity, committed), [], 'positive control');
  assert.equal(prepareCandidateIdentity({ ...c, committed }).productId, identity.productId);
  const previous = candidate('5.0.0-rc.13'), previousCommitted = committedFor(previous, deriveCandidateIdentity(previous));
  const rc1 = { productId: 'product://abiogenesis/typescript-tenant@5.0.0-rc.1', packageVersion: '5.0.0-rc.1' };
  const { resources, tenantManifest: tenant, expectedOutputs } = committed;
  const cases = [
    ['every generated resource of the previous RC', previousCommitted, /resource subject productId/],
    ['resource index of the RC1 coupling', { ...committed, resources: { ...resources, subject: { ...resources.subject, ...rc1 },
      prospectiveRelease: { ...resources.prospectiveRelease, productId: rc1.productId, ordinal: 1, version: '5.0.0-rc.1' } } }, /resource prospective ordinal/],
    ['RC1 generator package', { ...committed, resources: { ...resources, generator: { ...resources.generator, package: { name: PACKAGE_NAME, version: '5.0.0-rc.1' } } } },
      /resource generator package version/],
    ['resource release claim of other bytes', { ...committed, resources: { ...resources, prospectiveRelease: { ...resources.prospectiveRelease,
      releaseClaim: { ...resources.prospectiveRelease.releaseClaim, digest: label('older claim') } } } }, /resource release claim digest/],
    ['resource archive of another candidate', { ...committed, resources: { ...resources, subject: { ...resources.subject,
      archive: { ...resources.subject.archive, digest: label('other archive') } } } }, /resource subject archive digest/],
    ['tenant manifest claim refs of RC1', { ...committed, tenantManifest: { ...tenant, claims: tenant.claims.map(row =>
      ({ ...row, claimRef: row.claimRef.replace(claimRefPrefix(identity), 'claim://abiogenesis/typescript-tenant@5.0.0-rc.1/') })) } }, /claim refs outside/],
    ['tenant manifest of another Product', { ...committed, tenantManifest: { ...tenant, productId: rc1.productId } }, /tenant manifest product/],
    ['tenant manifest catalog of another version', { ...committed, tenantManifest: { ...tenant, publicContractCatalog: { ...tenant.publicContractCatalog,
      ref: 'catalog://abiogenesis/typescript-tenant/public-contracts@5.0.0-rc.1' } } }, /tenant manifest catalog/],
    ['expected outputs of another archive', { ...committed, expectedOutputs: { ...expectedOutputs, source: { ...expectedOutputs.source, archiveDigest: label('other archive') } } },
      /expected outputs archive digest/],
    ['expected outputs named for the previous RC', { ...committed, expectedOutputs: { ...expectedOutputs, source: { ...expectedOutputs.source,
      archive: 'abiogenesis-typescript-tenant-5.0.0-rc.13.tgz' } } }, /expected outputs archive "/],
    ['absent resource index', { ...committed, resources: undefined }, /resource index kind/],
  ];
  for (const [name, stale, pattern] of cases) {
    const failures = generatedResourceFailures(identity, stale);
    assert.ok(failures.some(row => pattern.test(row)), `${name}: ${failures.join('; ')}`);
    assert.throws(() => prepareCandidateIdentity({ ...c, committed: stale }), refusal('stale_resources'), name);
  }
  // A malformed identity refuses before the committed resources are consulted at all.
  const malformed = candidate(version);
  malformed.packageJson = { ...malformed.packageJson, version: '5.0.0-rc.014' };
  assert.throws(() => prepareCandidateIdentity({ ...malformed, committed: undefined }), refusal('noncanonical_version'));
});
