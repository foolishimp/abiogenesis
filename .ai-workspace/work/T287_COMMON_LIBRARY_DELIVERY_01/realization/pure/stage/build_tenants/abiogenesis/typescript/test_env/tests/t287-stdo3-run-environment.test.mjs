import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmod, copyFile, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test, { after, before } from 'node:test';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as product from '../../build/code/src/product/index.js';
import { isRunEnvironmentEvidence } from '../../build/code/src/abg/stdo_environment.js';
import { declarations } from '../fixtures/registered-selection-product/native.mjs';
import { STDO3_SOURCE, stdo3RunEnvironment } from '../support/stdo3-run-environment.mjs';

let root, sourceRoot, environment;
before(async () => {
  // The method manager selects only the exact pinned release. Tests mutate its
  // disposable inventory copy, never the installed source or a historical Run.
  const installed = JSON.parse(execFileSync('stdo', ['resolve', STDO3_SOURCE.basisRef], { encoding: 'utf8' })).path;
  root = await realpath(await mkdtemp(join(tmpdir(), 't287-stdo3-')));
  sourceRoot = join(root, 'source'); await mkdir(sourceRoot);
  const manifest = await readFile(join(installed, 'manifest.json'));
  assert.equal(product.sha256Bytes(manifest), STDO3_SOURCE.manifestDigest);
  await writeFile(join(sourceRoot, 'manifest.json'), manifest);
  for (const member of product.runEnvironmentRecordMembers('stdo_source_manifest@1', manifest)) {
    assert.equal(member.type, 'file');
    const target = join(sourceRoot, member.path); await mkdir(dirname(target), { recursive: true });
    await copyFile(join(installed, member.path), target);
    // This owned mirror alone is the changed-byte falsifier's write target.
    if (member.path === STDO3_SOURCE.memberPath) await chmod(target, 0o600);
  }
  environment = await stdo3RunEnvironment({ gtl, product, sourceRoot });
});
after(async () => { if (root) await rm(root, { recursive: true, force: true }); });

test('K11 current public specialization admits exact standalone STDO3 and conserves explicit source identity', () => {
  const d = environment.declaration;
  assert.strictEqual(gtl.constructStdoRunEnvironmentDeclaration(d), d);
  assert.ok(Object.isFrozen(d)); assert.equal(d.dependencies.length, 1);
  assert.equal(d.dependencies[0].recordDigest, STDO3_SOURCE.manifestDigest);
  assert.equal(d.corpusAccess, null); assert.deepEqual(d.accesses, []);
  assert.deepEqual(d.roles[0].accessRefs, []); assert.equal(environment.pythonPath, null);
  assert.deepEqual(d.roles[0].contextPolicy.selectors, ['full_source', 'active_binding_semantics']);
  assert.equal(d.contexts[0].members[0].digest, STDO3_SOURCE.memberDigest);
  assert.deepEqual(d.roles[0].frameRefs, ['executive', 'the-three-duties'].map(anchor =>
    STDO3_SOURCE.basisRef + STDO3_SOURCE.memberPath + '#' + anchor));
  const additional = structuredClone(d);
  additional.dependencies.push({ ...structuredClone(d.dependencies[0]), dependencyRef: 'dependency:second-explicit-source',
    basisRef: 'stdo://releases/v3.0.0-rc.2/' });
  assert.equal(gtl.constructStdoRunEnvironmentDeclaration(additional).dependencies.length, 2,
    'constructor preserves explicit additional dependencies; actual record acquisition remains separate');
  const generic = structuredClone(d);
  generic.dependencies[0].basisRef = generic.contexts[0].sourceLocator = 'generic://declared-source/';
  assert.strictEqual(gtl.constructRunEnvironmentDeclaration(generic), generic);
  assert.throws(() => gtl.constructStdoRunEnvironmentDeclaration(generic), /STDO requires exact source/);
  for (const mutate of [
    x => { x.dependencies = []; },
    x => { x.dependencies.push(structuredClone(x.dependencies[0])); },
    x => { x.dependencies[0].basisRef = x.contexts[0].sourceLocator = 'stdo://releases/v3.0.0-rc.1'; },
    x => { x.dependencies[0].recordFormat = 'member_inventory@1'; },
    x => { x.contexts[0].members[0].digest = product.sha256Canonical('wrong member'); },
    x => { x.roles[0].sourceBindings[0].endByte = x.contexts[0].members[0].byteCount + 1; },
    x => { x.roles[0].accessRefs = ['access:undeclared']; },
    x => { x.accesses = [{ accessRef: 'access:unexpected', operation: 'validate', mode: 'validation', frameIndexRefs: [], maxOutputBytes: 1000, timeoutMs: 100 }]; },
  ]) { const changed = structuredClone(d); mutate(changed); assert.throws(() => gtl.constructStdoRunEnvironmentDeclaration(changed), TypeError); }
});

test('K11 explicit corpus construction still requires every source, companion and role-access join', () => {
  // Declaration-only corpus fixture: this test performs no Python/tool access.
  const d = structuredClone(environment.declaration), digest = product.sha256Canonical('declared companion bytes');
  for (const [name, paths] of [['representation', ['map.json', 'program.json']], ['tool', ['ac.py', 'contract.md']]]) {
    const members = paths.map(path => ({ path, type: 'file', digest, target: null }));
    d.dependencies.push({ dependencyRef: `dependency:${name}`, basisRef: `${name}://explicit/`, recordRef: `record:${name}`,
      recordDigest: digest, recordFormat: 'release_record@1', inventoryDigest: gtl.stdoInventoryDigest(members), members });
  }
  d.corpusAccess = { kind: 'axiom_indexer', sourceDependencyRef: d.dependencies[0].dependencyRef,
    representationDependencyRef: 'dependency:representation', axiomDependencyRef: 'dependency:tool',
    program: { path: 'program.json', uri: 'program:explicit', byteDigest: digest, canonicalDigest: digest },
    map: { path: 'map.json', uri: 'map:explicit', byteDigest: digest, canonicalDigest: digest },
    executablePath: 'ac.py', outputContractPath: 'contract.md', pythonExecutableDigest: digest, pythonVersion: 'Python declared' };
  d.accesses = [{ accessRef: 'access:declared', operation: 'validate', mode: 'validation', frameIndexRefs: [], maxOutputBytes: 1000, timeoutMs: 100 }];
  d.roles[0].accessRefs = ['access:declared'];
  assert.strictEqual(gtl.constructStdoRunEnvironmentDeclaration(d), d);
  for (const mutate of [
    x => { x.roles[0].accessRefs = []; },
    x => { x.corpusAccess.sourceDependencyRef = 'dependency:representation'; },
    x => { x.dependencies[1].recordFormat = 'member_inventory@1'; },
    x => { x.dependencies.pop(); },
    x => { x.corpusAccess.program.byteDigest = product.sha256Canonical('crossed'); },
    x => { x.corpusAccess.executablePath = 'missing.py'; },
    x => { x.roles[0].accessRefs = ['access:missing']; },
  ]) { const changed = structuredClone(d); mutate(changed); assert.throws(() => gtl.constructStdoRunEnvironmentDeclaration(changed), TypeError); }
});

test('K11 actual Product acquisition checks manifest, complete source inventory, spans and permission without Python', async () => {
  const publication = declarations(gtl, environment.declaration), program = publication.programs[0];
  const authority = { authorityRef: 'authority:stdo3-test', authorityDigest: product.sha256Canonical('authority'), actorRef: 'actor:stdo3-test' };
  const archiveRoot = join(root, 'archive'); await mkdir(archiveRoot);
  const resources = await environment.resources({ authority, program, workspaceBinding: { roots: { archiveRoot } } });
  assert.deepEqual(resources.permission.operations, ['read_context']); assert.equal(resources.pythonPath, null);
  const input = { publication, program, authority, graphFunctions: publication.graphFunctions, archiveRoot, resources };
  const observed = await product.observeRunEnvironment(input);
  assert.equal(observed.kind, 'run_environment_observed', JSON.stringify(observed));
  assert.ok(isRunEnvironmentEvidence(observed.evidence));
  assert.equal(observed.evidence.corpusDocuments, null); assert.deepEqual(observed.evidence.accesses, []);
  const bytes = await readFile(join(sourceRoot, STDO3_SOURCE.memberPath));
  for (const [index, heading] of ['Executive', 'The three duties'].entries()) {
    const span = environment.declaration.roles[0].sourceBindings[index];
    const marker = Buffer.from(`### ${heading}\n`), start = bytes.indexOf(marker);
    const next = bytes.indexOf(Buffer.from('\n### '), start + marker.length), end = next < 0 ? bytes.length : next + 1;
    assert.equal(span.startByte, start); assert.equal(span.endByte, end);
    assert.equal(span.spanDigest, product.sha256Bytes(bytes.subarray(start, end)));
  }
  await writeFile(join(sourceRoot, 'unselected.txt'), 'No dependency or context identity is inferred from co-location.');
  assert.deepEqual(await product.observeRunEnvironment(input), observed);
  const wrongPermission = structuredClone(resources); wrongPermission.permission.authorityRef = 'authority:crossed';
  assert.equal((await product.observeRunEnvironment({ ...input, resources: wrongPermission })).cause, 'access_not_permitted');
  const wrongPython = structuredClone(resources);
  wrongPython.pythonPath = wrongPython.permission.pythonPath = resources.dependencies[0].recordPath;
  assert.equal((await product.observeRunEnvironment({ ...input, resources: wrongPython })).cause, 'access_not_permitted');
  const wrongDeclaration = structuredClone(environment.declaration);
  wrongDeclaration.roles[0].sourceBindings[0].spanDigest = product.sha256Canonical('wrong span');
  const rebound = structuredClone(resources); rebound.permission.environmentDigest = product.sha256Canonical(wrongDeclaration);
  assert.equal((await product.observeRunEnvironment({ ...input, publication: { ...publication, runEnvironments: [wrongDeclaration] }, resources: rebound })).cause, 'identity_mismatch');
  const memberPath = join(sourceRoot, STDO3_SOURCE.memberPath);
  await writeFile(memberPath, Buffer.concat([bytes, Buffer.from('\nchanged required bytes')]));
  assert.equal((await product.observeRunEnvironment(input)).cause, 'identity_mismatch');
  await writeFile(memberPath, bytes);
  await rename(memberPath, memberPath + '.unavailable');
  try { assert.equal((await product.observeRunEnvironment(input)).cause, 'access_unavailable'); }
  finally { await rename(memberPath + '.unavailable', memberPath); }
  assert.deepEqual(await product.observeRunEnvironment(input), observed);
});
