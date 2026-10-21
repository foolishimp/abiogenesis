// Separate Executive-authorized evidence successor; original failed verifier is immutable.
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
const failureOwner = await subject('code/src/abg/c_call_outcome.ts');
const nativeGate = await subject('code/src/abg/native_worksite_execution.ts');
const reentry = JSON.parse(await readFile(join(work, 'structure-reentry.json'), 'utf8'));
const repo = '/Users/jim/src/apps/abiogenesis';
assert.equal(archive.archive.sha256, reentry.archiveSha256);
assert.equal(sha(await readFile(join(repo, archive.archive.path))), reentry.archiveSha256);
for (const key of ['HOW', 'historicalFirstCause', 'historicalVerifier', 'historicalRunner',
                   'historicalRequest', 'historicalResult', 'stoppedRecords', 'frozenC0Diff', 'c0Freeze']) {
  const expected = reentry[key], bytes = await readFile(join(repo, expected.path));
  assert.equal(bytes.length, expected.bytes, key); assert.equal(sha(bytes), expected.sha256, key);
}
const precedence = JSON.parse(await readFile(join(work, 'precedence-ledger.json'), 'utf8'));
const emittedPins = JSON.parse(await readFile(join(work, 'expected-c0-emissions.json'), 'utf8'));
for (const pin of emittedPins.files) {
  const bytes = await readFile(join(work, 'stage', pin.path));
  assert.equal(bytes.length, pin.bytes, pin.path); assert.equal(sha(bytes), pin.sha256, pin.path);
}
const c0Subjects = [physicalScope, failureOwner, nativeGate, history];
const historical = new Map();
const diffBytes = await readFile(join(repo, reentry.frozenC0Diff.path));
const diffParts = diffBytes.toString('utf8').split(/(?=^--- original\/)/m);
// Apply exact unified-diff lines. This preserves all bytes; there is no syntax,
// identity or digest normalization and no external patch process.
function applyFrozenDiff(oldText, part) {
  const oldLines = oldText.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const lines = part.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  let cursor = 0, i = 2; const output = [];
  while (i < lines.length) {
    const hunk = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(lines[i++]);
    assert.ok(hunk, 'exact frozen diff hunk');
    const start = Number(hunk[1]) - 1, oldCount = Number(hunk[2] ?? 1), newCount = Number(hunk[4] ?? 1);
    assert.ok(start >= cursor); output.push(...oldLines.slice(cursor, start)); cursor = start;
    let consumed = 0, emitted = 0;
    while (i < lines.length && !lines[i].startsWith('@@ ')) {
      const line = lines[i++], kind = line[0], body = line.slice(1);
      assert.ok([' ', '+', '-'].includes(kind), 'diff body line');
      if (kind !== '+') { assert.equal(oldLines[cursor++], body); consumed++; }
      if (kind !== '-') { output.push(body); emitted++; }
    }
    assert.equal(consumed, oldCount); assert.equal(emitted, newCount);
  }
  output.push(...oldLines.slice(cursor)); return output.join('');
}
const exactC0Delta = [];
for (const current of c0Subjects) {
  const path = current.source.record.path.slice(('source/' + tenant + '/').length);
  const overlay = precedence.overlays.find(row => row.path === tenant + '/' + path);
  assert.ok(overlay, path); assert.equal(current.source.record.sha256, overlay.after.sha256);
  const old = await load(join(work, 'preimages', tenant), path);
  const oldEmitted = await load(join(work, '../combined-final-01/stage', tenant), current.emittedPath);
  assert.equal(old.record.sha256, overlay.before.sha256);
  const part = diffParts.filter(text => text.startsWith('--- original/' + tenant + '/' + path + '\n'));
  assert.equal(part.length, 1, path);
  assert.equal(applyFrozenDiff(old.text, part[0]), current.source.text, path);
  historical.set(path, { source: old, emitted: oldEmitted });
  exactC0Delta.push({ path, copiedPreimage: old.record, frozenAfter: current.source.record,
    exactFrozenDiffApplied: true, diffSha256: reentry.frozenC0Diff.sha256, ...current.correspondence });
}
function namedCalls(selected, name, node = selected.ast) {
  return selected.calls.filter(call => call.pos >= node.pos && call.end <= node.end &&
    ts.isIdentifier(call.expression) && call.expression.text === name);
}
function onlyCall(selected, name, node) {
  const calls = namedCalls(selected, name, node); assert.equal(calls.length, 1, name); return calls[0];
}
function args(selected, call) { return call.arguments.map(argument => argument.getText(selected.ast)); }
function descendants(node, predicate) {
  const found = []; function visit(n) { if (predicate(n)) found.push(n); ts.forEachChild(n, visit); }
  visit(node); return found;
}
function bodyContains(selected, name, texts) {
  const body = fn(selected, name).body.getText(selected.ast);
  for (const text of texts) assert.ok(body.includes(text), `${selected.record.path}::${name} missing ${text}`);
  return body;
}
function nodeCoordinate(selected, node) {
  const text = node.getText(selected.ast);
  return { line: selected.ast.getLineAndCharacterOfPosition(node.getStart(selected.ast)).line + 1,
    bytes: Buffer.byteLength(text), sha256: sha(text) };
}
const c0Routes = [];
for (const selected of [physicalScope.source, physicalScope.emitted]) {
  const collector = fn(selected, 'retiredWorksiteObservations');
  const collectorBody = bodyContains(selected, 'retiredWorksiteObservations', [
    'row.kind === "basis_admitted" ? row.payload.rawInputValue',
    'row.kind === "c_call_evidenced" && row.payload.evidenceClass === "worksite_file_replace" ? row.payload.request : null',
    '!isWorksiteFileReplaceRequest(request)', 'request.workspaceAuthorityBasis.canonicalRoot !== canonicalRoot',
    '!affectsPath(request.subject.relativePath)', 'retired.add(request.predecessorObservation.observationRef)',
    'isWorksiteObservation(row.payload.successorObservation)', 'retired.add(row.payload.successorObservation.observationRef)',
    'return [...retired]',
  ]);
  assert.ok(!collectorBody.includes('workspaceBinding'));
  assert.equal(count(selected, 'affectsPath', collector), 1);
  assert.equal(memberCalls(selected, 'add', collector), 2);
  const native = fn(selected, 'retiredNativeWorkObservations');
  assert.deepEqual(args(selected, onlyCall(selected, 'retiredWorksiteObservations', native)), [
    'task.workspaceAuthorityBasis.canonicalRoot',
    'path => changed === null ? nativeWorkspacePathWithin(path, task.writeRoots) : changed.has(path)', 'priorEvents',
  ]);
  assert.ok(!native.body.getText(selected.ast).includes('workspaceBinding'));
  const effect = fn(selected, 'eventCalculusEffectRefs');
  const clauses = descendants(effect.body, node => ts.isCaseClause(node) && ts.isStringLiteral(node.expression) &&
    node.expression.text === 'c_call_result_admitted');
  assert.equal(clauses.length, 1); const clause = clauses[0];
  assert.deepEqual(args(selected, onlyCall(selected, 'worksiteTransitionForResult', clause)), ['event', 'priorEvents']);
  assert.deepEqual(args(selected, onlyCall(selected, 'retiredWorksiteObservations', clause)), [
    'worksite.request.workspaceAuthorityBasis.canonicalRoot',
    'path => path === worksite.request.subject.relativePath', 'priorEvents',
  ]);
  assert.equal(count(selected, 'retiredWorksiteObservations'), 2);
  const filters = selected.calls.filter(call => call.pos >= clause.pos && call.end <= clause.end &&
    ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === 'filter');
  assert.equal(filters.length, 1);
  assert.deepEqual(args(selected, filters[0]), ['ref => ref !== worksite.after']);
  assert.ok(clause.getText(selected.ast).includes('new Set([worksite.before, ...retiredWorksite])'));
  assert.ok(clause.getText(selected.ast).includes('worksite === null || worksite.after === null'));
  for (const name of ['projectWorksiteFailureResultRequest', 'worksiteFailureResultDependencies']) {
    imported(selected, name, name, './c_call_outcome.js'); assert.equal(count(selected, name), 1);
  }
  assert.deepEqual(args(selected, onlyCall(selected, 'projectWorksiteFailureResultRequest', fn(selected, 'worksiteTransitionForResult'))),
    ['event', 'priorEvents']);
  bodyContains(selected, 'worksiteTransitionForResult', ['event.payload.resultClass === "failure"',
    'request === null ? null : { request, before: request.predecessorObservation.observationRef',
    'after: null, successorObservation: null']);
  assert.equal(count(selected, 'worksiteTransitionForResult', fn(selected, 'projectWorksiteTransitionForResult')), 1);
  bodyContains(selected, 'projectWorksiteTransitionForResult', ['const { request: _request, ...projected } = transition', 'return projected']);
  const dependencies = fn(selected, 'eventCalculusDependencies');
  assert.deepEqual(args(selected, onlyCall(selected, 'worksiteFailureResultDependencies', dependencies)), ['prefix', 'event']);
  bodyContains(selected, 'eventCalculusDependencies', [
    'payload?.contractRef === WORKSITE_C0_IDS.outputContractRef',
    'payload?.contractRef === WORKSITE_C0_IDS.failureContractRef && isWorksitePostPublicationFailure(payload.value)',
    'for (const row of worksiteFailureResultDependencies(prefix, event))', 'selected.set(row.eventId, row)',
    'add("worksite-observation-dependency")',
  ]);
  for (const retired of ['projectWorksiteFailureBasis', 'worksiteFailureAuthorization']) {
    assert.equal(count(selected, retired), 0); assert.equal(selected.imports.filter(row => row.local === retired).length, 0);
  }
  assert.ok(!selected.text.includes('resultDigest !== sha256Canonical(resultBody)'));
  c0Routes.push({ representation: selected.record.path, collector: coordinate(selected, collector),
    nativeWrapper: coordinate(selected, native), resultCase: nodeCoordinate(selected, clause),
    dependencies: coordinate(selected, dependencies), internalTransition: coordinate(selected, fn(selected, 'worksiteTransitionForResult')),
    publicProjection: coordinate(selected, fn(selected, 'projectWorksiteTransitionForResult')),
    collectorCallCount: 2, nativeCallCount: 1, c0CallCount: 1, ownAfterExclusionCount: 1,
    failureOwnerCallCount: 1, dependencyOwnerCallCount: 1, bindingPartitionAbsent: true, oldLocalFailureJoinRemoved: true });
}
const authentication = [];
const oldEC = historical.get('code/src/abg/event_calculus.ts');
const oldFailureOwner = historical.get('code/src/abg/c_call_outcome.ts');
for (const [selected, previous, isSource] of [[failureOwner.source, oldFailureOwner.source, true],
                                            [failureOwner.emitted, oldFailureOwner.emitted, false]]) {
  const name = 'projectWorksiteFailureResultRequest', owner = fn(selected, name);
  assert.equal(fn(selected, 'projectWorksiteFailureBasis').body.getText(selected.ast),
    fn(previous, 'projectWorksiteFailureBasis').body.getText(previous.ast));
  const clauses = [
    '!isJsonRecord(event.payload) || event.payload.resultClass !== "failure"',
    'Array.isArray(refs) && refs.every(ref => typeof ref === "string")',
    'row.kind === "c_call_evidenced" && row.aggregateId === event.aggregateId',
    'isJsonRecord(row.payload)', 'evidenceRefs.includes(row.payload.evidenceRef',
    'evidenceRows.length === 1', 'event.kind !== "c_call_result_admitted" || evidenceRefs.length !== 1',
    'event.payload.cCallRef !== event.aggregateId', 'event.payload.contractRef !== WORKSITE_C0_IDS.failureContractRef',
    'event.payload.valueKind !== "worksite_effect_refusal"', 'resultDigest !== sha256Canonical(resultBody)',
    'resultRef !== `result://abiogenesis/${String(resultDigest).slice("sha256:".length)}`',
    isSource ? 'event.payload.valueDigest !== sha256Canonical(event.payload.value!)' : 'event.payload.valueDigest !== sha256Canonical(event.payload.value)',
    'evidenceEvent === null || !isJsonRecord(evidenceEvent.payload)', 'evidenceEvent.admissionOrdinal >= event.admissionOrdinal',
    'evidenceEvent.basisId !== event.basisId', 'evidenceEvent.runId !== event.runId',
    'evidenceEvent.graphCallId !== event.graphCallId', 'evidenceEvent.frameId !== event.frameId',
    '!event.causationEventRefs.includes(evidenceEvent.eventId)', 'row.admissionOrdinal < evidenceEvent.admissionOrdinal',
    'authenticated === null', 'authenticated.executionBasis.basisRef !== event.basisId',
    'authenticated.cCall.runId !== event.runId', 'evidenceBody.cCallRef !== event.aggregateId',
    'evidenceBody.evidenceClass !== "deterministic"', 'evidenceBody.implementationRef !== authenticated.authorization.implementationRef',
    isSource ? 'evidenceBody.inputDigest !== sha256Canonical(authenticated.request as unknown as JsonValue)' : 'evidenceBody.inputDigest !== sha256Canonical(authenticated.request)',
    'evidenceBody.outputDigest !== event.payload.valueDigest', 'evidenceDigest !== sha256Canonical(evidenceBody)',
    'evidenceRef !== `evidence://abiogenesis/${String(evidenceDigest).slice("sha256:".length)}`', 'return authenticated.request',
  ];
  bodyContains(selected, name, clauses);
  assert.equal(count(selected, 'projectWorksiteFailureBasis', owner), 1);
  assert.equal(count(selected, 'sha256Canonical', owner), 4);
  const deps = fn(selected, 'worksiteFailureResultDependencies');
  bodyContains(selected, 'worksiteFailureResultDependencies', [
    'event.kind !== "c_call_result_admitted" || !isJsonRecord(event.payload)',
    'event.payload.contractRef !== WORKSITE_C0_IDS.failureContractRef', '!isWorksitePostPublicationFailure(event.payload.value)',
    'validatedRuntimeEventPrefixBeforeEvent(prefix, event.eventId)', 'worksiteFailureAuthorization(event.payload.value)',
    'indexedRuntimeEvents(before, key)', 'selected.set(row.eventId, row)', 'add("aggregate:c_call:" + event.aggregateId)',
    'add("basis:" + authorization.executionBasisRef)', 'add("payload:artifactRef:" + authorization.workspaceBindingIdentity)',
    'row.kind === "basis_admitted" && row.basisId === authorization.executionBasisRef',
    'isJsonRecord(basis.payload)', 'typeof basis.payload.implementationSetRef === "string"',
    'add("payload:implementationSetRef:" + basis.payload.implementationSetRef)',
    'sort((a, b) => a.admissionOrdinal - b.admissionOrdinal)',
  ]);
  assert.equal(count(selected, 'validatedRuntimeEventPrefixBeforeEvent', deps), 1);
  assert.equal(count(selected, 'worksiteFailureAuthorization', deps), 1);
  assert.equal(count(selected, 'indexedRuntimeEvents', deps), 1);
  assert.equal(count(selected, 'add', deps), 4);
  assert.ok(!deps.body.getText(selected.ast).includes('worksite-observation-dependency'));
  imported(selected, 'validatedRuntimeEventPrefixBeforeEvent', 'validatedRuntimeEventPrefixBeforeEvent', './event_prefix.js');
  assert.equal(previous.functions.filter(node => node.name.text === name).length, 0);
  assert.equal(previous.functions.filter(node => node.name.text === 'worksiteFailureResultDependencies').length, 0);
  const old = isSource ? oldEC.source : oldEC.emitted;
  assert.equal(count(old, 'projectWorksiteFailureBasis', fn(old, 'projectWorksiteTransitionForResult')), 1);
  assert.equal(count(old, 'worksiteFailureAuthorization', fn(old, 'eventCalculusDependencies')), 1);
  authentication.push({ representation: selected.record.path, resultOwner: coordinate(selected, owner),
    dependencyOwner: coordinate(selected, deps), retainedBasisOwner: coordinate(selected, fn(selected, 'projectWorksiteFailureBasis')),
    basisOwnerBodyExactlyUnchanged: true, checkedClauses: clauses,
    oldLocalFailureBody: coordinate(old, fn(old, 'projectWorksiteTransitionForResult')),
    oldLocalDependencyBody: coordinate(old, fn(old, 'eventCalculusDependencies')),
    fullBasisOwnerCalls: 1, canonicalDigestChecks: 4, strictBeforeSelectorCalls: 1, dependencyKeyCalls: 4 });
}
const gateRoutes = [];
for (const selected of [nativeGate.source, nativeGate.emitted]) {
  const gate = fn(selected, 'worksiteCommandSourcesInvalidatedAfter');
  for (const name of ['projectWorksiteFailureResultRequest', 'worksiteFailureResultDependencies']) {
    imported(selected, name, name, './c_call_outcome.js'); assert.equal(count(selected, name), 1);
  }
  assert.deepEqual(args(selected, onlyCall(selected, 'worksiteFailureResultDependencies', gate)), ['prefix', 'e']);
  assert.deepEqual(args(selected, onlyCall(selected, 'projectWorksiteFailureResultRequest', gate)), ['e', 'dependencies']);
  bodyContains(selected, 'worksiteCommandSourcesInvalidatedAfter', [
    'e.kind === "c_call_result_admitted"',
    'dependencies.length === 0 ? null : projectWorksiteFailureResultRequest(e, dependencies)',
    'request !== null', 'request.workspaceAuthorityBasis.canonicalRoot === canonicalRoot',
    'invalidates(request.subject.relativePath)',
    'readRoots === undefined ? selected.has(path)', ': nativeWorkspacePathWithin(path, readRoots)',
  ]);
  gateRoutes.push({ representation: selected.record.path, function: coordinate(selected, gate),
    completeFailureOwnerCalls: 1, exactDependencyOwnerCalls: 1, canonicalRootAndAffectedPathRequired: true });
}
const candidateIndex = [];
for (const selected of [history.source, history.emitted]) {
  const selector = fn(selected, 'runtimeHistorySelectorKeys');
  const condition = descendants(selector.body, node => ts.isIfStatement(node) &&
    node.expression.getText(selected.ast).includes('payload.value.phase === "post_publication"'));
  assert.equal(condition.length, 1); const index = condition[0];
  for (const clause of ['event.kind === "c_call_result_admitted"', 'record(payload.value)',
    'payload.value.kind === "native_workspace_work_observation"', 'payload.value.kind === "native_workspace_work_failure"',
    'payload.value.kind === "worksite_effect_refusal"', 'payload.value.phase === "post_publication"'])
    assert.ok(index.expression.getText(selected.ast).includes(clause));
  assert.equal(index.thenStatement.getText(selected.ast), 'keys.push("worksite-observation-dependency");');
  for (const name of ['projectWorksiteFailureResultRequest', 'worksiteFailureResultDependencies']) {
    assert.equal(count(selected, name), 0); assert.equal(selected.imports.filter(row => row.local === name).length, 0);
  }
  candidateIndex.push({ representation: selected.record.path, candidateCondition: nodeCoordinate(selected, index),
    selector: coordinate(selected, selector), candidateBucketOnly: true,
    authenticationRemainsInECAndGate: true });
}
const c0 = { exactC0Delta, c0Routes, authentication, gateRoutes, candidateIndex,
  frozenDelta: reentry.frozenC0Diff, completeConePinnedToSameArchive: true,
  historicalStructuralFailure: reentry.historicalFirstCause,
  structuralOnly: true, dynamicLawClaim: false };

const k11 = await subject('code/src/gtl/stdo_run_environment.ts');
const oldPure = await load(join(work, '../combined-final-01/preimages/pure', tenant), 'code/src/gtl/stdo_run_environment.ts');
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
const report = { kind: 'COMBINED-FINAL-STRUCTURE-02_bounded_structural_source_emission_archive_correspondence', status: 'satisfied',
  archiveSha256: archive.archive.sha256, pureRetiredBodies: pure,
  commonOwners, lifetimeConsumers: lifetime, u1: { retiredPrivateJoin, currentness,
    dependencyIndex: history.correspondence, physicalScope: physicalScope.correspondence }, c0,
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
await writeFile(join(work, 'structural-correspondence-successor-02.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify({ status: report.status, retiredPureBodies: pure.length,
  lifetimeConsumers: lifetime.reduce((n, row) => n + row.sharedAcquisitions, 0),
  u1CommonConsumers: currentness.length, k11Join: true, c0ProductionFiles: exactC0Delta.length, c0CompleteCone: true, inspectedFiles: files.size }) + '\n');
