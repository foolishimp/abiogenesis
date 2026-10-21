import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmod, copyFile, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test, { after, before } from 'node:test';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as product from '../../build/code/src/product/index.js';
import { isRunEnvironmentEvidence } from '../../build/code/src/abg/stdo_environment.js';
import { declarations, NATIVE_SELECTION_STDO3_ROLE } from '../fixtures/registered-selection-product/native.mjs';
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

function withGenericMaterial(declaration) {
  const d = structuredClone(declaration), bytes = Buffer.from('Generic role material carries no STDO method text.\n');
  const member = { path: 'generic-policy.txt', type: 'file', digest: product.sha256Bytes(bytes), target: null };
  const record = Buffer.from(JSON.stringify({ kind: 'run_environment_member_inventory', schemaVersion: '5.0.0', members: [member] }));
  const members = product.runEnvironmentRecordMembers('member_inventory@1', record);
  assert.deepEqual(members, [member]);
  const contextMember = { memberRef: 'member:k11-generic', path: member.path, byteCount: bytes.length, digest: member.digest };
  d.dependencies.push({ dependencyRef: 'dependency:k11-generic', basisRef: 'generic://k11-source/', recordRef: 'record:k11-generic',
    recordDigest: product.sha256Bytes(record), recordFormat: 'member_inventory@1', inventoryDigest: gtl.stdoInventoryDigest(members), members });
  d.contexts.push({ contextRef: 'context:k11-generic', sourceLocator: 'generic://k11-source/',
    inventoryDigest: product.sha256Canonical([contextMember]), members: [contextMember] });
  return { d, genericBinding: { contextRef: 'context:k11-generic', memberRef: contextMember.memberRef,
    memberDigest: member.digest, startByte: 0, endByte: bytes.length, spanDigest: member.digest } };
}

function assertEveryRoleBindsNativeSource(declaration) {
  const { d, genericBinding } = withGenericMaterial(declaration), original = d.roles[0];
  d.roles = ['author', 'assessor', 'constructor', 'command_executor', 'selector'].map(role => ({
    ...structuredClone(original), role, programLocusRef: original.programLocusRef + '/' + role,
    sourceBindings: [structuredClone(genericBinding), ...structuredClone(original.sourceBindings)],
  }));
  assert.strictEqual(gtl.constructStdoRunEnvironmentDeclaration(d), d,
    'every role may retain extra generic material before its explicit native source binding');
  assert.ok(Object.isFrozen(d));
  for (let index = 0; index < d.roles.length; index += 1) {
    const crossed = structuredClone(d);
    crossed.roles[index].sourceBindings = [structuredClone(genericBinding)];
    assert.strictEqual(gtl.constructRunEnvironmentDeclaration(crossed), crossed,
      'generic environment still accepts explicit generic material');
    assert.throws(() => gtl.constructStdoRunEnvironmentDeclaration(crossed), /native source material for every role/,
      `STDO frame names and other roles cannot supply ${crossed.roles[index].role}'s missing native material`);
  }
  const allCrossed = structuredClone(d);
  for (const role of allCrossed.roles) role.sourceBindings = [structuredClone(genericBinding)];
  assert.strictEqual(gtl.constructRunEnvironmentDeclaration(allCrossed), allCrossed);
  assert.throws(() => gtl.constructStdoRunEnvironmentDeclaration(allCrossed), /native source material for every role/);
  const misleadingUri = structuredClone(allCrossed);
  misleadingUri.dependencies.at(-1).basisRef = misleadingUri.contexts.at(-1).sourceLocator = 'stdo://releases/generic-inventory/';
  assert.strictEqual(gtl.constructRunEnvironmentDeclaration(misleadingUri), misleadingUri);
  assert.throws(() => gtl.constructStdoRunEnvironmentDeclaration(misleadingUri), /native source material for every role/,
    'an STDO-shaped URI with a generic inventory format does not supply native source material');
  const secondSource = structuredClone(d), source = structuredClone(d.dependencies[0]), context = structuredClone(d.contexts[0]);
  source.dependencyRef = 'dependency:k11-second-stdo'; source.basisRef = 'stdo://releases/another-explicit-cut/';
  source.recordRef = source.basisRef + 'manifest.json';
  context.contextRef = 'context:k11-second-stdo'; context.sourceLocator = source.basisRef;
  secondSource.dependencies.push(source); secondSource.contexts.push(context);
  for (const role of secondSource.roles) for (const binding of role.sourceBindings) {
    if (binding.contextRef === d.contexts[0].contextRef) binding.contextRef = context.contextRef;
  }
  assert.strictEqual(gtl.constructStdoRunEnvironmentDeclaration(secondSource), secondSource,
    'roles may bind a different unique explicit STDO source without positional source selection');
}

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

test('ordinary selector data uses complete Executive source while the P4 default remains exact', async () => {
  const ordinary=await stdo3RunEnvironment({gtl,product,sourceRoot,selectorRole:NATIVE_SELECTION_STDO3_ROLE});
  assert.deepEqual(ordinary.declaration.roles,[NATIVE_SELECTION_STDO3_ROLE]);
  assert.deepEqual(ordinary.declaration.roles[0].sourceBindings.map(({startByte,endByte})=>[startByte,endByte]),[[83537,89094]]);
  const bytes=await readFile(join(sourceRoot,STDO3_SOURCE.memberPath)),span=ordinary.declaration.roles[0].sourceBindings[0];
  assert.equal(product.sha256Bytes(bytes.subarray(span.startByte,span.endByte)),span.spanDigest);
  assert.match(bytes.subarray(span.startByte,span.endByte).toString(),/^## 8\. Derived Executive frame\n/);
  assert.equal(ordinary.pythonPath,null);assert.deepEqual(ordinary.declaration.accesses,[]);
  const p4=await stdo3RunEnvironment({gtl,product,sourceRoot});
  assert.deepEqual(p4.declaration,environment.declaration,'explicit ordinary data does not mutate the default declaration');
  assert.deepEqual(p4.declaration.roles[0].sourceBindings.map(({startByte,endByte,spanDigest})=>({startByte,endByte,spanDigest})),[
    {startByte:55240,endByte:55942,spanDigest:'sha256:f570de4d76c017e873f390926698a04c9704c443e602092c4c13985b5eb4cd80'},
    {startByte:64650,endByte:65910,spanDigest:'sha256:20ec39085c7dbe19a1b7a06f00d8dcadf7b82e4cb9c163be282e7a3a53b6a68e'},
  ]);
  assert.equal(p4.declaration.roles[0].policy.digest,'sha256:902f5f27e841498f5e44c8f1eebc65856c4f39f8ff0f58fc4d3f5cbfcaa6667a');
  await assert.rejects(stdo3RunEnvironment({gtl,product}),/explicit exact STDO3 sourceRoot/);
});

test('K11 every standalone role binds native STDO material while additional generic material remains explicit', () => {
  assertEveryRoleBindsNativeSource(environment.declaration);
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
  assertEveryRoleBindsNativeSource(d);
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
