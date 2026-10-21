import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import ts from './stage/build_tenants/abiogenesis/typescript/node_modules/typescript/lib/typescript.js';

const work = import.meta.dirname, tenant = 'build_tenants/abiogenesis/typescript';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const archive = JSON.parse(await readFile(join(work, 'archive-members.json'), 'utf8'));
const members = new Map(archive.files.map(row => [row.path, row]));
const files = new Map();
async function load(root, path) {
  const full = join(root, path), bytes = await readFile(full), text = bytes.toString('utf8');
  const ast = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, path.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS);
  assert.equal(ast.parseDiagnostics.length, 0, full);
  const functions = [], calls = [], imports = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name && node.body) functions.push(node);
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer &&
        (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
      functions.push({ name: node.name, body: node.initializer.body,
        getText: () => node.getText(ast), getStart: () => node.getStart(ast) });
    }
    if (ts.isCallExpression(node)) calls.push(node);
    if (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      for (const binding of node.importClause.namedBindings.elements) imports.push({
        local: binding.name.text, exported: binding.propertyName?.text ?? binding.name.text, from: node.moduleSpecifier.text,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const record = { path: relative(work, full), sha256: sha(bytes), bytes: bytes.length };
  files.set(full, record);
  return { ast, text, functions, calls, imports, record };
}
const beforeSource = join(work, '../../proof/baseline/source', tenant);
const beforeEmit = join(work, '../../proof/baseline-build', tenant);
async function subject(path) {
  const source = await load(join(work, 'source', tenant), path);
  const emittedPath = `build/${path.replace(/\.ts$/, '.js')}`;
  const emitted = await load(join(work, 'stage', tenant), emittedPath);
  const member = members.get(emittedPath);
  assert.ok(member, emittedPath);
  assert.equal(member.sha256, emitted.record.sha256);
  assert.equal(member.bytes, emitted.record.bytes);
  const declarationPath = emittedPath.replace(/\.js$/, '.d.ts');
  const declaration = await readFile(join(work, 'stage', tenant, declarationPath));
  assert.equal(members.get(declarationPath)?.sha256, sha(declaration));
  return { source, emitted, emittedPath, member, declarationPath,
    correspondence: { source: source.record, emission: emitted.record, archiveMember: member,
      declarationArchiveMember: members.get(declarationPath), sourceExcludedFromPackage: !members.has(path) } };
}
function count(subject, identifier, node = subject.ast) {
  return subject.calls.filter(call => call.pos >= node.pos && call.end <= node.end &&
    ts.isIdentifier(call.expression) && call.expression.text === identifier).length;
}
function memberCalls(subject, name, node = subject.ast) {
  return subject.calls.filter(call => call.pos >= node.pos && call.end <= node.end &&
    ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === name).length;
}
function fn(subject, name) {
  const selected = subject.functions.filter(f => f.name.text === name);
  assert.equal(selected.length, 1, `${subject.record.path}::${name}`);
  return selected[0];
}
function coordinate(subject, node) {
  return { line: subject.ast.getLineAndCharacterOfPosition(node.getStart(subject.ast)).line + 1,
    bodySha256: sha(node.body.getText(subject.ast)), bodyBytes: Buffer.byteLength(node.body.getText(subject.ast)) };
}
function imported(subject, local, exported, from) {
  assert.deepEqual(subject.imports.filter(row => row.local === local), [{ local, exported, from }]);
}

const pure = [];
for (const [path, local, currentLocal, exported, from] of [
  ['code/src/product/environment_definition_bindings.ts', 'sameJson', 'sameJson', 'sameJson', '../shared/definition_binding_mechanics.js'],
  ['code/src/product/environment_definition_bindings.ts', 'sameCoordinate', 'sameCoordinate', 'sameCoordinate', '../shared/definition_binding_mechanics.js'],
  ['code/src/product/verification_definition_bindings.ts', 'sameCoordinate', 'sameCoordinate', 'sameCoordinate', '../shared/definition_binding_mechanics.js'],
  ['code/src/shared/rooted_topology_partition.ts', 'hasExactKeys', 'hasExactKeys', 'hasExactKeys', './admission_predicates.js'],
  ['code/src/abg/event_body_encoding.ts', 'exactKeys', 'hasExactKeys', 'hasExactKeys', '../shared/admission_predicates.js'],
]) {
  const current = await subject(path), old = await load(beforeSource, path), oldEmit = await load(beforeEmit, current.emittedPath);
  const oldBody = coordinate(old, fn(old, local)), oldEmittedBody = coordinate(oldEmit, fn(oldEmit, local));
  for (const selected of [current.source, current.emitted]) {
    assert.equal(selected.functions.filter(f => f.name.text === local).length, 0);
    imported(selected, currentLocal, exported, from);
    assert.equal(count(selected, currentLocal), count(old, local));
    assert.ok(count(selected, currentLocal) > 0);
  }
  pure.push({ path, local, currentLocal, sharedExport: exported, import: from, baselineLocalBody: oldBody,
    baselineEmittedBody: oldEmittedBody, candidateLocalBodyAbsent: true,
    callCountBeforeAndAfter: count(old, local), ...current.correspondence });
}
for (const [path, local, from] of [
  ['code/src/product/execution_resolution.ts', 'exact', './exact_match.js'],
  ['code/src/shared/definition_binding_mechanics.ts', 'selectedDefinition', '../product/exact_match.js'],
]) {
  const current = await subject(path), old = await load(beforeSource, path), oldEmit = await load(beforeEmit, current.emittedPath);
  for (const selected of [old, oldEmit]) assert.ok(memberCalls(selected, 'filter', fn(selected, local)) > 0);
  for (const selected of [current.source, current.emitted]) {
    imported(selected, 'resolveExactMatch', 'resolveExactMatch', from);
    assert.equal(memberCalls(selected, 'filter', fn(selected, local)), 0);
    assert.equal(count(selected, 'resolveExactMatch', fn(selected, local)), 1);
  }
  pure.push({ path, retainedProjection: local, baselineLocalBody: coordinate(old, fn(old, local)),
    baselineEmittedBody: coordinate(oldEmit, fn(oldEmit, local)),
    candidateBody: coordinate(current.source, fn(current.source, local)),
    candidateEmittedBody: coordinate(current.emitted, fn(current.emitted, local)),
    privateFilterRemoved: true, actualCommonCallCount: 1, ...current.correspondence });
}
const commonOwners = [];
for (const [path, names] of [
  ['code/src/product/exact_match.ts', ['resolveExactMatch']],
  ['code/src/shared/admission_predicates.ts', ['hasExactKeys']],
  ['code/src/shared/definition_binding_mechanics.ts', ['sameJson', 'sameCoordinate']],
  ['code/src/shared/owned_process_lifetime.ts', ['createOwnedProcessLifetime', 'createMonotonicDeadline']],
  ['code/src/abg/native_work_effect.ts', ['nativeWorkUnknownEffectDependencies', 'projectNativeWorkUnknownEffectTask']],
]) {
  const current = await subject(path);
  for (const name of names) { fn(current.source, name); fn(current.emitted, name); }
  commonOwners.push({ path, names, ...current.correspondence });
}

const lifetime = [];
for (const [path, names] of [
  ['code/src/abg/worker_transport.ts', ['runProcess']],
  ['code/src/implementation/worksite_command_helper.ts', ['runCommand', 'runHttpProbe']],
]) {
  const current = await subject(path), old = await load(beforeSource, path);
  for (const selected of [current.source, current.emitted]) {
    imported(selected, 'createOwnedProcessLifetime', 'createOwnedProcessLifetime', '../shared/owned_process_lifetime.js');
    assert.equal(count(selected, 'createOwnedProcessLifetime'), names.length);
    for (const name of names) assert.equal(count(selected, 'createOwnedProcessLifetime', fn(selected, name)), 1);
    assert.equal(selected.functions.filter(f => f.name.text === 'waitForExit').length, 0);
  }
  assert.equal(count(old, 'createOwnedProcessLifetime'), 0);
  assert.ok(count(current.source, 'setTimeout') < count(old, 'setTimeout'));
  lifetime.push({ path, consumers: names.map(name => ({ name, before: coordinate(old, fn(old, name)),
    after: coordinate(current.source, fn(current.source, name)), emitted: coordinate(current.emitted, fn(current.emitted, name)) })),
    sharedAcquisitions: names.length, rawSetTimeoutCallsBefore: count(old, 'setTimeout'),
    rawSetTimeoutCallsAfter: count(current.source, 'setTimeout'),
    oldWaitForExitBodies: old.functions.filter(f => f.name.text === 'waitForExit').length,
    newWaitForExitBodies: 0, ...current.correspondence });
}
const currentness = [];
for (const path of ['code/src/abg/event_calculus.ts', 'code/src/abg/native_worksite_execution.ts']) {
  const current = await subject(path);
  for (const selected of [current.source, current.emitted]) {
    for (const name of ['nativeWorkUnknownEffectDependencies', 'projectNativeWorkUnknownEffectTask']) {
      imported(selected, name, name, './native_work_effect.js'); assert.ok(count(selected, name) > 0);
    }
    assert.equal(selected.functions.filter(f => f.name.text === 'nativeTaskForTransportException').length, 0);
  }
  currentness.push({ path, commonCalls: ['nativeWorkUnknownEffectDependencies', 'projectNativeWorkUnknownEffectTask']
    .map(name => ({ name, sourceCalls: count(current.source, name), emittedCalls: count(current.emitted, name) })), ...current.correspondence });
}
const oldEventCalculus = await load(beforeSource, 'code/src/abg/event_calculus.ts');
const retiredPrivateJoin = coordinate(oldEventCalculus, fn(oldEventCalculus, 'nativeTaskForTransportException'));
const history = await subject('code/src/abg/runtime_history.ts');
for (const selected of [history.source, history.emitted]) assert.match(selected.text,
  /event\.kind === "actor_process_termination_unconfirmed"\s*\|\|\s*\(event\.kind === "actor_invocation_failed" && payload\.failureClass === "transport_exception"\)\)\s*keys\.push\("worksite-observation-dependency"\)/);
const physicalScope = await subject('code/src/abg/event_calculus.ts');
for (const selected of [physicalScope.source, physicalScope.emitted]) {
  const body = fn(selected, 'retiredNativeWorkObservations').body.getText(selected.ast);
  assert.ok(body.includes('request.workspaceAuthorityBasis.canonicalRoot !== task.workspaceAuthorityBasis.canonicalRoot'));
  assert.ok(!body.includes('workspaceBinding'));
}

const k11 = await subject('code/src/gtl/stdo_run_environment.ts');
const oldPure = await load(join(work, 'preimages/pure', tenant), 'code/src/gtl/stdo_run_environment.ts');
assert.equal(fn(k11.source, 'constructRunEnvironmentDeclaration').getText(k11.source.ast),
  fn(oldPure, 'constructRunEnvironmentDeclaration').getText(oldPure.ast));
for (const selected of [k11.source, k11.emitted]) {
  const body = fn(selected, 'constructStdoRunEnvironmentDeclaration').body.getText(selected.ast);
  assert.ok(body.includes('constructRunEnvironmentDeclaration(value)'));
  assert.match(body, /d\.roles\.some\(r => !r\.sourceBindings\.some\(b =>/);
  assert.ok(body.includes('source.basisRef === context?.sourceLocator'));
  assert.ok(body.indexOf('source.basisRef === context?.sourceLocator') < body.indexOf('a !== null'));
}
assert.ok(!fn(oldPure, 'constructStdoRunEnvironmentDeclaration').body.getText(oldPure.ast).includes('context?.sourceLocator'));
const report = { kind: 'bounded_structural_source_emission_archive_correspondence', status: 'satisfied',
  archiveSha256: archive.archive.sha256, pureRetiredBodies: pure,
  commonOwners, lifetimeConsumers: lifetime, u1: { retiredPrivateJoin, currentness,
    dependencyIndex: history.correspondence, physicalScope: physicalScope.correspondence },
  k11: { genericConstructorSourceExactlyUnchangedFromPure: true, everyRoleMaterialJoinBeforeCorpusBranch: true,
    before: coordinate(oldPure, fn(oldPure, 'constructStdoRunEnvironmentDeclaration')),
    after: coordinate(k11.source, fn(k11.source, 'constructStdoRunEnvironmentDeclaration')), ...k11.correspondence },
  inspectedFiles: [...files.values()],
  limitations: ['Structural declaration/import/call/body and exact byte correspondence only; no selected owner executed.',
    'Archive contains emitted modules and declarations; TypeScript source remains the frozen external build input.',
    'Installed reachability, semantic sufficiency, behavioral conservation and benefit remain separate L4/P1-P5 proof.',
    'Residual unselected exact-match filters and existing Unicode NUL-joined key domain remain unchanged.',
    'Existing HTTP polling and emergency parent-exit signal remain owner-specific; no claim that all timers or signals moved.'],
};
await writeFile(join(work, 'structural-correspondence.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify({ status: report.status, retiredPureBodies: pure.length,
  lifetimeConsumers: lifetime.reduce((n, row) => n + row.sharedAcquisitions, 0),
  u1CommonConsumers: currentness.length, k11Join: true, inspectedFiles: files.size }) + '\n');
