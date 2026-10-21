// U1-CROSS-BINDING-TRIAGE-01. One actual controlled-component discriminator.
// Frozen support/owners are imported unchanged. No installed/native claim.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createU1Fixture, product, hash, identity, current, prefixOf }
  from '../currentness-consumers/stage-01/build_tenants/abiogenesis/typescript/test_env/support/t287-native-work-currentness-consumers.mjs';
import * as calculus from '../currentness-consumers/stage-01/build_tenants/abiogenesis/typescript/build/code/src/abg/event_calculus.js';
import { projectNativeWorkUnknownEffectTask }
  from '../currentness-consumers/stage-01/build_tenants/abiogenesis/typescript/build/code/src/abg/native_work_effect.js';
import { worksiteCommandSourcesInvalidatedAfter }
  from '../currentness-consumers/stage-01/build_tenants/abiogenesis/typescript/build/code/src/abg/native_worksite_execution.js';
import { selectHeldEventStoreDurablePrefix }
  from '../currentness-consumers/stage-01/build_tenants/abiogenesis/typescript/build/code/src/abg/event_store.js';

const here = import.meta.dirname;
assert.equal(resolve(process.env.TMPDIR), join(here, 'physical'), 'all new disposable effects stay in this activation');
assert.equal(process.env.ABG_WORKSITE_BUILD_ROOT, undefined, 'no ambient build override');
const attempts = [], cleanupCallbacks = [], inputs = {}, outputs = {};
let fixture, frontier = 'callable preflight';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
async function write(name, value) {
  await fs.writeFile(join(here, name), JSON.stringify(value, null, 2) + '\n');
}
async function physicalFiles(root) {
  const rows = [];
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name), stat = await fs.lstat(path);
    if (entry.isDirectory()) rows.push(...await physicalFiles(path));
    else if (entry.isFile()) {
      const bytes = await fs.readFile(path);
      rows.push({ path, device: stat.dev, inode: stat.ino, bytes: bytes.length,
        sha256: sha256(bytes), base64: bytes.toString('base64') });
    } else rows.push({ path, kind: 'non-regular', device: stat.dev, inode: stat.ino });
  }
  return rows;
}
async function retain(name, error = null) {
  const owner = fixture ?? attempts.findLast(a => a.store), store = owner?.store;
  const coordinate = store ? selectHeldEventStoreDurablePrefix(store) : null;
  let journal = null;
  if (coordinate) {
    const path = new URL(coordinate.eventLogRef), bytes = await fs.readFile(path), stat = await fs.stat(path);
    journal = { coordinate, device: stat.dev, inode: stat.ino, bytes: bytes.length,
      sha256: sha256(bytes), base64: bytes.toString('base64') };
  }
  await write(name, { activation: 'U1-CROSS-BINDING-TRIAGE-01', frontier, inputs, outputs,
    error: error && { name: error.name, message: error.message, stack: error.stack },
    admittedRows: store?.readAll() ?? [], candidates: owner?.candidates ?? [], journal,
    attempts: attempts.map(a => ({ scratch: a.scratch, canonicalRoot: a.canonicalRoot, otherScratch: a.otherScratch })),
    physical: await physicalFiles(join(here, 'physical')), cleanup: 'none; all roots retained',
    physicalNativeOrCommandActorLaunches: 0,
    lowerPremises: 'Cold installation/binding/grant/Program coordinates and native actor/process occurrence are controlled premises. Product request construction and file observation, EventStore admission, causal authentication, indexes and EventCalculus are actual. processId 12345 is a fixture fact, not a launched child.' });
}

try {
  const checks = [
    ['createU1Fixture', createU1Fixture], ['product.constructWorksiteTerritory', product.constructWorksiteTerritory],
    ['product.constructWorksiteSubject', product.constructWorksiteSubject], ['product.observeWorksiteSubject', product.observeWorksiteSubject],
    ['product.constructWorksiteFileReplaceRequest', product.constructWorksiteFileReplaceRequest],
    ['product.isWorksiteFileReplaceRequest', product.isWorksiteFileReplaceRequest],
    ['calculus.deriveRuntimeEventCalculusProjection', calculus.deriveRuntimeEventCalculusProjection],
    ['calculus.eventCalculusDependencies', calculus.eventCalculusDependencies],
    ['calculus.projectNativeWorkRetiredObservations', calculus.projectNativeWorkRetiredObservations],
    ['projectNativeWorkUnknownEffectTask', projectNativeWorkUnknownEffectTask],
    ['worksiteCommandSourcesInvalidatedAfter', worksiteCommandSourcesInvalidatedAfter],
    ['selectHeldEventStoreDurablePrefix', selectHeldEventStoreDurablePrefix], ['prefixOf', prefixOf], ['current', current],
  ].map(([name, value]) => ({ name, callable: typeof value === 'function' }));
  await write('callable-preflight.json', checks);
  assert.ok(checks.every(row => row.callable));
  frontier = 'original frozen fixture';
  fixture = await createU1Fixture({ after(callback) { cleanupCallbacks.push(callback); } }, ['target.txt'],
    { onAttempt: attempt => attempts.push(attempt) });
  const f = fixture;
  frontier = 'second binding and exact Product C0 request';
  const { kind: bk, schemaVersion: bv, bindingId: bi, bindingDigest: bd, admissionEventRef: be, ...bindingBody } = f.workspaceBinding;
  const nextBindingBody = { ...bindingBody, productSetId: 'product-set://u1/cross-binding-triage', productSetDigest: hash('cross-binding-triage-products') };
  const bindingDigest = hash(nextBindingBody), workspaceBinding = { kind: 'workspace_binding', schemaVersion: '5.0.0',
    bindingId: identity('workspace-binding', bindingDigest), bindingDigest, ...nextBindingBody,
    admissionEventRef: 'event://u1/controlled-cross-binding-premise' };
  const { kind: gk, schemaVersion: gv, grantRef: gr, grantDigest: gd, ...grantBody } = f.capabilityGrant;
  const nextGrantBody = { ...grantBody, scopeRef: workspaceBinding.bindingId, scopeDigest: bindingDigest }, grantDigest = hash(nextGrantBody);
  const rebound = { ...f, workspaceBinding, capabilityGrant: { kind: 'capability_grant', schemaVersion: '5.0.0',
    grantRef: identity('capability-grant', grantDigest), grantDigest, ...nextGrantBody } };
  const territory = product.constructWorksiteTerritory({ ...rebound, relativeRoot: '.', territoryUri: pathToFileURL(f.canonicalRoot).href });
  const subject = product.constructWorksiteSubject({ ...rebound, relativePath: 'target.txt', subjectUri: pathToFileURL(join(f.canonicalRoot, 'target.txt')).href });
  const predecessorObservation = await product.observeWorksiteSubject(f.workspaceAuthorityBasis, workspaceBinding, subject);
  const request = product.constructWorksiteFileReplaceRequest({ ...rebound, territory, subject, predecessorObservation,
    replacementBytes: Buffer.from('candidate\n') });
  Object.assign(inputs, { b1: f.workspaceBinding, b2: workspaceBinding, b2Grant: rebound.capabilityGrant,
    request, task: f.task, canonicalRoot: f.canonicalRoot });
  await retain('constructed-inputs.json');
  assert.equal(product.isWorksiteFileReplaceRequest(request), true, JSON.stringify(request));
  assert.notEqual(request.workspaceBindingIdentity, f.task.workspaceBinding.bindingId);
  assert.notEqual(request.workspaceBindingDigest, f.task.workspaceBinding.bindingDigest);
  assert.equal(request.workspaceAuthorityBasis.canonicalRoot, f.task.workspaceAuthorityBasis.canonicalRoot);
  assert.equal(hash(nextBindingBody), workspaceBinding.bindingDigest);
  assert.equal(hash(nextGrantBody), rebound.capabilityGrant.grantDigest);
  frontier = 'actual second-binding invocation and C0 basis admission';
  const b2 = f.atCut(() => {
    const invocation = f.invocation(rebound);
    const basis = f.basisFor(rebound, invocation, request);
    return { invocation, basis };
  });
  inputs.admittedB2 = b2;
  const selected = [
    { label: 'b2 same-root affected C0 predecessor', request, expectedAfter: false },
    { label: 'b1 same-root affected control', request: f.requests.find(r => r.subject.relativePath === 'target.txt'), expectedAfter: false },
    { label: 'b1 same-root unaffected sibling', request: f.requests.find(r => r.subject.relativePath === 'keep.txt'), expectedAfter: true },
    { label: 'other-root unaffected control', request: f.foreign, expectedAfter: true },
  ];
  const beforeRows = f.rows(), beforePrefix = f.prefix(), beforeProjection = calculus.deriveRuntimeEventCalculusProjection(beforePrefix);
  const beforeOrdinal = beforeRows.at(-1).admissionOrdinal;
  outputs.before = selected.map(row => ({ label: row.label, binding: row.request.workspaceBindingIdentity,
    root: row.request.workspaceAuthorityBasis.canonicalRoot, path: row.request.subject.relativePath,
    observationRef: row.request.predecessorObservation.observationRef,
    current: current(beforeProjection, row.request.predecessorObservation),
    invalidated: worksiteCommandSourcesInvalidatedAfter(beforePrefix, beforeOrdinal,
      row.request.workspaceAuthorityBasis.canonicalRoot, [row.request.subject.relativePath]) }));
  await retain('before-cause.json');
  assert.ok(outputs.before.every(row => row.current === true && row.invalidated === false));
  frontier = 'actual admitted authenticated b1 unknown-effect cause';
  const cause = f.cause(), afterPrefix = f.prefix(), afterProjection = calculus.deriveRuntimeEventCalculusProjection(afterPrefix);
  inputs.cause = cause;
  const authenticated = projectNativeWorkUnknownEffectTask(cause, beforeRows);
  const dependencies = calculus.eventCalculusDependencies(afterPrefix, cause, beforeRows);
  outputs.authentication = { authenticatedTask: authenticated, matchesActualTask: hash(authenticated) === hash(f.task),
    b2BasisSelectedByIndex: dependencies.some(row => row.eventId === b2.basis.admissionEventRef),
    dependencyEventRefs: dependencies.map(row => row.eventId) };
  outputs.retired = calculus.projectNativeWorkRetiredObservations(cause, beforeRows);
  const fullProjection = calculus.deriveRuntimeEventCalculusProjection(prefixOf(f.rows()));
  outputs.after = selected.map(row => ({ label: row.label, expectedCurrent: row.expectedAfter,
    current: current(afterProjection, row.request.predecessorObservation),
    fullCurrent: current(fullProjection, row.request.predecessorObservation),
    invalidated: worksiteCommandSourcesInvalidatedAfter(afterPrefix, beforeOrdinal,
      row.request.workspaceAuthorityBasis.canonicalRoot, [row.request.subject.relativePath]),
    retiredRefSelected: outputs.retired.includes(row.request.predecessorObservation.observationRef) }));
  outputs.noNewResult = f.rows().filter(row => row.kind === 'c_call_result_admitted').length ===
    beforeRows.filter(row => row.kind === 'c_call_result_admitted').length;
  outputs.onlyCauseAppended = f.rows().length === beforeRows.length + 1 && f.rows().at(-1).eventId === cause.eventId;
  await retain('after-cause.json');
  assert.deepEqual(authenticated, f.task, 'actual unknown-effect cause authenticates');
  assert.equal(outputs.authentication.b2BasisSelectedByIndex, true, 'index did not exclude the b2 C0 row');
  assert.equal(outputs.noNewResult, true); assert.equal(outputs.onlyCauseAppended, true);
  for (const row of outputs.after) assert.equal(row.fullCurrent, row.current, row.label + ': indexed/full agreement');
  for (const row of outputs.after.slice(1)) {
    assert.equal(row.current, row.expectedCurrent, row.label);
    assert.equal(row.invalidated, !row.expectedCurrent, row.label + ': physical-scope invalidator');
  }
  const cross = outputs.after[0];
  assert.equal(cross.invalidated, true, 'native gate recognizes the genuine same-root scope');
  outputs.productRelation = cross.current === cross.expectedCurrent ? 'satisfied_for_this_case' : 'falsified';
  outputs.decidingClaim = 'Authenticated b1 unknown native effects retire a previously current valid b2 C0 observation at the same canonical root and affected path.';
  frontier = 'closed deciding observation; no repair or retry';
  await retain('result.json');
  console.log(JSON.stringify({ status: outputs.productRelation, controls: outputs.after, frontier, retained: here }));
} catch (error) {
  await retain('unexpected-failure.json', error);
  console.error(error.stack); process.exitCode = 1;
} finally {
  fixture?.store.closeDurableLog();
  // Deliberately do not call fixture cleanup: preserve exact physical/log evidence.
}
