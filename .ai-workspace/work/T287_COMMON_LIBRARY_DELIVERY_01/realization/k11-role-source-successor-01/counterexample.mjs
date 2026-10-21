import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import * as gtl from './stage/build_tenants/abiogenesis/typescript/build/code/src/gtl/index.js';
import * as product from './stage/build_tenants/abiogenesis/typescript/build/code/src/product/index.js';
import { STDO3_SOURCE, stdo3RunEnvironment } from './stage/build_tenants/abiogenesis/typescript/test_env/support/stdo3-run-environment.mjs';

const work = import.meta.dirname, mode = process.argv[2];
assert.ok(['old', 'new'].includes(mode));
if (mode === 'old') {
  const resolution = JSON.parse(execFileSync('stdo', ['resolve', STDO3_SOURCE.basisRef], { encoding: 'utf8' }));
  const installed = await realpath(resolution.path), mirror = join(work, 'resources/counterexample-stdo-source');
  await mkdir(mirror);
  assert.notEqual(await realpath(mirror), installed);
  const manifest = await readFile(join(installed, 'manifest.json'));
  assert.equal(product.sha256Bytes(manifest), STDO3_SOURCE.manifestDigest);
  await writeFile(join(mirror, 'manifest.json'), manifest);
  const sourceMembers = product.runEnvironmentRecordMembers('stdo_source_manifest@1', manifest);
  assert.ok(sourceMembers);
  for (const member of sourceMembers) {
    assert.equal(member.type, 'file');
    const bytes = await readFile(join(installed, member.path));
    assert.equal(product.sha256Bytes(bytes), member.digest);
    const target = join(mirror, member.path);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(installed, member.path), target);
  }
  const selected = ['standards/frames/bootstrap.md', 'standards/EXECUTIVE_BASELINE.md', 'standards/ASSURANCE.md'];
  const acquired = [];
  for (const path of selected) {
    const bytes = await readFile(join(installed, path));
    acquired.push({ uri: STDO3_SOURCE.basisRef + path, path: join(installed, path), bytes: bytes.length,
      sha256: product.sha256Bytes(bytes), mode: '0o' + ((await stat(join(installed, path))).mode & 0o777).toString(8),
      manifestMember: sourceMembers.find(member => member.path === path) });
    assert.ok(acquired.at(-1).manifestMember);
  }
  await writeFile(join(work, 'method-sources.json'), JSON.stringify({ resolution, manifestDigest: STDO3_SOURCE.manifestDigest,
    sourceMembersVerified: sourceMembers.length, acquired, mirror: await realpath(mirror), installed, distinct: true }, null, 2) + '\n');
  const environment = await stdo3RunEnvironment({ gtl, product, sourceRoot: mirror });
  const d = structuredClone(environment.declaration);
  const bytes = Buffer.from('Generic role material carries no STDO method text.\n');
  const member = { path: 'generic-policy.txt', type: 'file', digest: product.sha256Bytes(bytes), target: null };
  const record = Buffer.from(JSON.stringify({ kind: 'run_environment_member_inventory', schemaVersion: '5.0.0', members: [member] }));
  const members = product.runEnvironmentRecordMembers('member_inventory@1', record);
  assert.deepEqual(members, [member]);
  const contextMember = { memberRef: 'member:k11-generic', path: member.path, byteCount: bytes.length, digest: member.digest };
  d.dependencies.push({ dependencyRef: 'dependency:k11-generic', basisRef: 'generic://k11-source/', recordRef: 'record:k11-generic',
    recordDigest: product.sha256Bytes(record), recordFormat: 'member_inventory@1', inventoryDigest: gtl.stdoInventoryDigest(members), members });
  d.contexts.push({ contextRef: 'context:k11-generic', sourceLocator: 'generic://k11-source/',
    inventoryDigest: product.sha256Canonical([contextMember]), members: [contextMember] });
  for (const role of d.roles) role.sourceBindings = [{ contextRef: 'context:k11-generic', memberRef: contextMember.memberRef,
    memberDigest: member.digest, startByte: 0, endByte: bytes.length, spanDigest: member.digest }];
  const corpus = structuredClone(d), digest = product.sha256Canonical('declared companion bytes');
  for (const [name, paths] of [['representation', ['map.json', 'program.json']], ['tool', ['ac.py', 'contract.md']]]) {
    const members = paths.map(path => ({ path, type: 'file', digest, target: null }));
    corpus.dependencies.push({ dependencyRef: `dependency:${name}`, basisRef: `${name}://explicit/`, recordRef: `record:${name}`,
      recordDigest: digest, recordFormat: 'release_record@1', inventoryDigest: gtl.stdoInventoryDigest(members), members });
  }
  corpus.corpusAccess = { kind: 'axiom_indexer', sourceDependencyRef: corpus.dependencies[0].dependencyRef,
    representationDependencyRef: 'dependency:representation', axiomDependencyRef: 'dependency:tool',
    program: { path: 'program.json', uri: 'program:explicit', byteDigest: digest, canonicalDigest: digest },
    map: { path: 'map.json', uri: 'map:explicit', byteDigest: digest, canonicalDigest: digest },
    executablePath: 'ac.py', outputContractPath: 'contract.md', pythonExecutableDigest: digest, pythonVersion: 'Python declared' };
  corpus.accesses = [{ accessRef: 'access:declared', operation: 'validate', mode: 'validation', frameIndexRefs: [], maxOutputBytes: 1000, timeoutMs: 100 }];
  for (const role of corpus.roles) role.accessRefs = ['access:declared'];
  await writeFile(join(work, 'counterexample-inputs.json'), JSON.stringify({ kind: 'exact_owner_constructor_counterexamples',
    nativeSource: STDO3_SOURCE, genericBodyBase64: bytes.toString('base64'), genericRecordBase64: record.toString('base64'),
    cases: [{ name: 'null-corpus-generic-only-role', value: d }, { name: 'explicit-corpus-generic-only-role', value: corpus }] }, null, 2) + '\n');
}
const inputs = JSON.parse(await readFile(join(work, 'counterexample-inputs.json'), 'utf8'));
const outcomes = [];
for (const entry of inputs.cases) {
  const value = entry.value, valueDigest = product.sha256Canonical(value);
  assert.strictEqual(gtl.constructRunEnvironmentDeclaration(value), value);
  assert.ok(Object.isFrozen(value));
  assert.ok(value.roles.every(role => role.frameRefs.every(frame => frame.startsWith(STDO3_SOURCE.basisRef))));
  assert.ok(value.roles.every(role => role.sourceBindings.every(binding => binding.contextRef === 'context:k11-generic')));
  if (mode === 'old') assert.strictEqual(gtl.constructStdoRunEnvironmentDeclaration(value), value);
  else assert.throws(() => gtl.constructStdoRunEnvironmentDeclaration(value), /STDO requires exact source/);
  outcomes.push({ name: entry.name, valueDigest, genericAcceptedSameValue: true,
    specialization: mode === 'old' ? 'accepted-same-value' : 'TypeError', frameRefsStillSTDO: true, allBoundMaterialGeneric: true });
}
const result = { kind: 'K11-owner-constructor-observation', mode, outcomes, nativeDispatches: 0, corpusToolLaunches: 0, runtimeAdmissionClaim: false };
await writeFile(join(work, `counterexample-${mode}-result.json`), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
