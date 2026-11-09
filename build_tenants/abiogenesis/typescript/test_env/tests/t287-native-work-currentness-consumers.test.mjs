import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createU1Fixture, product, hash, ids, identity, clone, current, component, traceInvalidator, admittedResult, admitNativeSource, semanticFixtureHelpers, componentNativeAssessment,
  createWorksiteCauseHistory, eventVisitCounter, builtModuleExports } from '../support/t287-native-work-currentness-consumers.mjs';
import { publicOperationBasis } from '../support/root-installed-environment.mjs';
import * as p from '../../build/code/src/product/index.js';
import * as g from '../../build/code/src/gtl/index.js';
import * as calculus from '../../build/code/src/abg/event_calculus.js';
import * as prefixes from '../../build/code/src/abg/event_prefix.js';
import * as nativeOwner from '../../build/code/src/abg/native_worksite_execution.js';
import { constructNativeWorkspaceWorkObservation, constructNativeWorkspaceWorkTask, isNativeWorkspaceWorkTask,
  isNativeWorkspaceWorkObservation, isNativeWorkspaceWorkFailure, nativeWorkspaceChangedPaths,
  nativeWorkspaceScopeViolations } from '../../build/code/src/product/native_workspace_work.js';
import { isCapabilityGrantValue } from '../../build/code/src/product/invocation.js';
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from '../../build/code/src/abg/invocation_execution_truth.js';
import * as assessmentOwner from '../../build/code/src/product/native_workspace_assessment.js';
import { projectNativeWorkUnknownEffectTask } from '../../build/code/src/abg/native_work_effect.js';
import { selectHeldEventStoreDurablePrefix, appendCheckedArtifactEvent } from '../../build/code/src/abg/event_store.js';
import { projectWorksiteSelectedOccurrence, worksiteSelectedOccurrenceDependencies, projectWorksiteFailureBasis, projectWorksiteFailureResultRequest, worksiteFailureResultDependencies } from '../../build/code/src/abg/c_call_outcome.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { isExactOperationInvocationCoordinate } from '../../build/code/src/shared/operation_definition_coordinate.js';

const results = [], fixtures = [], attempts = [], physicalFacts = [], gateTraces = [], gateOutputs = [], handoffChecks = [], contextChecks = [];
const CASE_NAMES = ['c0', 'observed', 'governance', 'semanticFold', 'revisionIntake', 'revisionEvidence'];
const FIRST_CASE = process.env.ABG_U1_FIRST_CASE ?? 'c0';
if (!CASE_NAMES.includes(FIRST_CASE)) throw new TypeError('unknown ABG_U1_FIRST_CASE');
const selectedCases = CASE_NAMES.slice(CASE_NAMES.indexOf(FIRST_CASE)), omittedCases = CASE_NAMES.slice(0, CASE_NAMES.indexOf(FIRST_CASE));
let proofSucceeded = false;
const preserveOnFailure = t => ({ after(callback) { t.after(async () => { if (proofSucceeded) await callback(); }); } });
const traced = label => { const trace = traceInvalidator(); gateTraces.push({ label, calls: trace.calls }); return trace; };
const observed = (owner, output) => { gateOutputs.push({ owner, output }); return output; };
const checkedHandoff = (label, value, callables, fields) => {
  assert.ok(value && typeof value === 'object', label + ': return object');
  for (const name of callables) assert.equal(typeof value[name], 'function', label + '.' + name);
  for (const name of fields) assert.ok(Object.hasOwn(value, name), label + '.' + name);
  handoffChecks.push({ label, callables, fields, actualKeys: Object.keys(value) }); return value;
};
async function physicalInventory(root) {
  const rows = [];
  async function walk(dir) { for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name), stat = await fs.lstat(path);
    if (entry.isDirectory()) { rows.push({ path, kind: 'directory', device: stat.dev, inode: stat.ino }); await walk(path); }
    else if (entry.isFile()) { const bytes = await fs.readFile(path); rows.push({ path, kind: 'file', device: stat.dev, inode: stat.ino,
      bytes: bytes.length, digest: p.sha256Bytes(bytes), base64: bytes.toString('base64') }); }
    else rows.push({ path, kind: 'other', device: stat.dev, inode: stat.ino });
  } }
  try { await walk(root); } catch (error) { rows.push({ root, readError: String(error) }); }
  return rows;
}
async function retainedJournal(store) {
  if (!store) return null;
  const coordinate = selectHeldEventStoreDurablePrefix(store);
  const path = new URL(coordinate.eventLogRef), bytes = await fs.readFile(path), stat = await fs.stat(path);
  return { coordinate, physical: { device: stat.dev, inode: stat.ino, byteLength: bytes.length,
    digest: p.sha256Bytes(bytes), base64: bytes.toString('base64') } };
}
const retain = async () => {
  if (!process.env.ABG_U1_EVIDENCE_DIR) return;
  await fs.mkdir(process.env.ABG_U1_EVIDENCE_DIR, { recursive: true });
  await fs.writeFile(join(process.env.ABG_U1_EVIDENCE_DIR, 'consumer-results.json'), JSON.stringify({ results, physicalFacts, gateTraces, gateOutputs, handoffChecks, contextChecks, selectedCases, omittedCases, cleanupOnSuccessOnly: true,
    attempts: await Promise.all(attempts.map(async a => ({ scratch: a.scratch, canonicalRoot: a.canonicalRoot, otherScratch: a.otherScratch,
      prefix: a.rows ? a.rows() : null, journal: await retainedJournal(a.store), candidates: a.candidates ?? null, physical: await physicalInventory(a.canonicalRoot) }))),
    fixtures: fixtures.map(f => ({ canonicalRoot: f.canonicalRoot, workspaceBinding: f.workspaceBinding,
      task: f.task, admittedPrefix: f.rows(), candidates: f.candidates })) }, null, 2) + '\n');
};
const selected = async (t, roots = ['target.txt'], options) => {
  const f = await createU1Fixture(preserveOnFailure(t), roots, { ...options, onAttempt: attempt => { attempts.push(attempt); } }); fixtures.push(f);
  checkedHandoff('createU1Fixture', f, ['cause', 'exit', 'append', 'atCut', 'invocation', 'basisFor', 'prefix', 'rows'],
    ['workspaceAuthorityBasis', 'workspaceBinding', 'capabilityGrant', 'canonicalRoot', 'task', 'requests', 'store', 'inv', 'set', 'basis', 'common', 'cCall']);
  checkedHandoff('createU1Fixture.store', f.store, ['readAll', 'readScope', 'configuredDurableLogPath', 'closeDurableLog'], []);
  return f;
};
const proveCause = f => {
  const before = f.rows(), event = f.cause(), prefix = f.prefix();
  assert.deepEqual(projectNativeWorkUnknownEffectTask(event, before), f.task);
  return { event, prefix };
};

async function c0Success(t) {
  const f = await selected(t), request = f.requests.find(r => r.subject.relativePath === 'target.txt');
  const before = calculus.deriveRuntimeEventCalculusProjection(f.prefix());
  assert.equal(current(before, request.predecessorObservation), true);
  const execution = f.atCut(() => f.basisFor(f, f.inv, request, {
    graphFunctionRef: f.executionBasis.graphFunctionRef, graphFunctionDigest: f.executionBasis.graphFunctionDigest,
    implementationSetRef: f.implementationSet.implementationSetRef, implementationSetDigest: f.implementationSet.implementationSetDigest }));
  const executionBasis = { kind: 'execution_basis', schemaVersion: '5.0.0', disposition: 'admitted', ...execution };
  const callBody = { basisId: execution.basisRef, graphCallId: 'graph-call://u1/c0', frameId: 'frame://u1/c0',
    vectorIndex: 0, stageRole: 'file-replace', taskOrdinal: null, attempt: 1, programLocusRef: f.cCall.programLocusRef, retryPath: [] };
  const cCallDigest = hash(callBody), cCall = { ...f.cCall, ...callBody, cCallRef: `c-call:${cCallDigest}`, cCallDigest };
  const authorization = product.constructWorksiteEffectAuthorization({ ...f, executionBasis, cCall, request });
  assert.equal(authorization.kind, 'worksite_effect_authorization', JSON.stringify(authorization));
  const input = { workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding,
    implementationSet: f.implementationSet, executionBasis, cCall, request, authorization };
  assert.equal(product.isWorksiteFileReplaceInput(input), true);
  const physicalPrefix = selectHeldEventStoreDurablePrefix(f.store);
  const physical = await product.replaceWorksiteFile(input);
  physicalFacts.push({ owner: "replaceWorksiteFile", scratch: f.scratch, input, physicalPrefix, physical }); await retain();
  assert.equal(physical.kind, 'worksite_file_replace_result', JSON.stringify(physical));
  assert.equal(physical.disposition, 'committed');
  assert.equal(await fs.readFile(join(f.canonicalRoot, 'target.txt'), 'utf8'), 'candidate\n');
  assert.equal(current(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), physical.successorObservation), false,
    'a physical receipt alone is not ABG successor currentness');
  assert.deepEqual(selectHeldEventStoreDurablePrefix(f.store), physicalPrefix);
  const scope = { basisId: execution.basisRef, graphFunctionRef: execution.graphFunctionRef,
    graphCallId: callBody.graphCallId, frameId: callBody.frameId };
  const output = { kind: 'worksite_file_replace_output', schemaVersion: '5.0.0', authorization,
    receipt: physical.receipt, successorObservation: physical.successorObservation };
  const evidenced = f.atCut(() => {
    const opened = f.append('c_call_opened', 'c_call', cCall.cCallRef,
      { cCallRef: cCall.cCallRef, cCallDigest, callClass: 'leaf', programLocusRef: cCall.programLocusRef }, scope);
    const fibre = f.append('c_call_fibre_selected', 'c_call', cCall.cCallRef,
      { cCallRef: cCall.cCallRef, callClass: 'leaf', armId: 'arm://u1/c0', regime: 'F_D',
        implementationRef: cCall.implementationRef, implementationBindingRef: cCall.implementationBindingRef },
      { ...scope, causationEventRefs: [opened.eventId] });
    const body = { cCallRef: cCall.cCallRef, contractRef: g.WORKSITE_C0_IDS.outputContractRef,
      evidenceClass: 'worksite_file_replace', implementationRef: cCall.implementationRef,
      inputDigest: hash(request), outputDigest: hash(output), request, authorization,
      receipt: physical.receipt, successorObservation: physical.successorObservation };
    const evidenceDigest = hash(body), evidenceRef = identity('evidence', evidenceDigest);
    return f.append('c_call_evidenced', 'c_call', cCall.cCallRef, { ...body, evidenceRef, evidenceDigest },
      { ...scope, causationEventRefs: [fibre.eventId] });
  });
  assert.equal(current(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), physical.successorObservation), false,
    'evidence admission alone is not C0 success Result admission');
  const admitted = admittedResult(f, output, { callRef: cCall.cCallRef, contractRef: g.WORKSITE_C0_IDS.outputContractRef,
    evidenceRefs: [evidenced.payload.evidenceRef], scope: { ...scope, causationEventRefs: [evidenced.eventId] } });
  assert.deepEqual(calculus.projectWorksiteTransitionForResult(admitted.event, f.rows().filter(e => e.admissionOrdinal < admitted.event.admissionOrdinal)),
    { before: request.predecessorObservation.observationRef, after: physical.successorObservation.observationRef, successorObservation: physical.successorObservation });
  const committed = calculus.deriveRuntimeEventCalculusProjection(f.prefix());
  assert.equal(current(committed, request.predecessorObservation), false);
  assert.equal(current(committed, physical.successorObservation), true);
  const priorResults = f.rows().filter(e => e.kind === 'c_call_result_admitted').length;
  const { event } = proveCause(f), after = calculus.deriveRuntimeEventCalculusProjection(f.prefix());
  assert.equal(current(after, physical.successorObservation), false);
  assert.equal(current(after, f.requests.find(r => r.subject.relativePath === 'keep.txt').predecessorObservation), true);
  assert.equal(f.rows().filter(e => e.kind === 'c_call_result_admitted').length, priorResults, 'unknown effect creates no Result');
  assert.deepEqual(f.rows().at(-1), event);
  assert.equal(await fs.readFile(join(f.canonicalRoot, 'target.txt'), 'utf8'), 'candidate\n', 'unknown effect does not fabricate rollback');
  results.push({ owner: 'Product replaceWorksiteFile -> EventStore -> EventCalculus', case: 'admitted C0 successor',
    physical, evidenceEvent: evidenced.eventId, resultEvent: admitted.event.eventId, causeEvent: event.eventId,
    beforeCause: true, afterCause: false, siblingCurrent: true, lowerPremises: 'cold installation/binding/implementation coordinates; actual Product effect and EventStore evidence/Result admission; controlled native actor/process facts, no process launch' });
}

const assessmentContract = { contractRef: 'contract://u1/consumer-assessment', contractVersion: '5.0.0', contractKind: 'output', valueKind: 'consumer_outcome_assessment' };
const assessmentSchema = { $id: assessmentContract.contractRef, type: 'object', additionalProperties: false,
  required: ['kind', 'disposition', 'reason', 'unresolvedCriteria'], properties: { kind: { const: assessmentContract.valueKind },
    disposition: { type: 'string', enum: ['satisfied', 'unmet', 'indeterminate'] }, reason: { type: 'string' }, unresolvedCriteria: { type: 'array', items: { type: 'string' } } } };
async function governanceInput(f, path) {
  const context = await product.observeWorksiteContext({ ...f, readRoots: [path], maxFiles: 30, maxBytes: 10000 });
  const order = { outcome: 'Assess the complete selected file', instructions: ['Use declared source only.'], readFirst: [path], writeRoots: [], checks: [] };
  const state = p.constructGovernanceWorkState({ taskRef: 'task://u1/' + path, task: 'Check the selected bounded source.',
    sources: [{ path, digest: context.entries[0].digest }], requiredSupportRefs: ['support://u1/selected'], authorityRefs: [],
    readRoots: [path], maxContextFiles: 30, maxContextBytes: 10000, maxPromptBytes: 10000,
    workOrders: { construction: order, testing: order, uat: order }, testing: { selectedPaths: [path],
      commands: [{ commandId: 'command://u1/check', executable: process.execPath, args: ['--version'], relativeCwd: '.', environment: {}, timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }],
      outcomePredicates: [], allowedWriteTerritories: [] },
    // Disjoint roles as governanceConsumers materializes them; the observed consumers read none of them.
    assessment: { sources: [path + '.source'], candidatePath: path, rubricPath: path + '.rubric', resultContract: assessmentContract,
      schemaAsset: { productId: 'product://u1/consumer', contractId: assessmentContract.contractRef,
        bytesBase64: Buffer.from(JSON.stringify(assessmentSchema) + '\n').toString('base64') }, verdictField: 'disposition', satisfiedValue: 'satisfied' } });
  const subject = product.constructWorksiteSubject({ ...f, relativePath: path, subjectUri: pathToFileURL(join(f.canonicalRoot, path)).href });
  const observation = await product.observeWorksiteSubject(f.workspaceAuthorityBasis, f.workspaceBinding, subject);
  const task = p.constructObservedWorksiteCommandExecutionTask({ ...f, observedFiles: [{ subject, observation }], ...p.governanceTestingConfiguration(state) });
  return { context, state, task };
}

async function observedConsumers(t) {
  const f = await selected(t), trace = traced('consumer'), c2 = p.WORKSITE_COMMAND_EXECUTION_IDS, checks = [];
  const { kind: _bk, schemaVersion: _bv, bindingId: _bi, bindingDigest: _bd, admissionEventRef: _be, ...bindingBody } = f.workspaceBinding;
  const nextBindingBody = { ...bindingBody, productSetId: 'product-set://u1/later-consumer', productSetDigest: hash('later-consumer-products') };
  const bindingDigest = hash(nextBindingBody), workspaceBinding = { kind: 'workspace_binding', schemaVersion: '5.0.0',
    bindingId: identity('workspace-binding', bindingDigest), bindingDigest, ...nextBindingBody, admissionEventRef: 'event://u1/controlled-binding-successor' };
  const { kind: _gk, schemaVersion: _gv, grantRef: _gr, grantDigest: _gd, ...grantBody } = f.capabilityGrant;
  const nextGrantBody = { ...grantBody, scopeRef: workspaceBinding.bindingId, scopeDigest: bindingDigest }, grantDigest = hash(nextGrantBody);
  const rebound = { ...f, workspaceBinding, capabilityGrant: { kind: 'capability_grant', schemaVersion: '5.0.0',
    grantRef: identity('capability-grant', grantDigest), grantDigest, ...nextGrantBody } };
  for (const [path, differentBinding] of [['target.txt', false], ['keep.txt', false], ['target.txt', true]]) {
    const operating = differentBinding ? rebound : f;
    const { state, task } = await governanceInput(operating, path), label = path.replaceAll('.', '-') + (differentBinding ? '-rebound' : '');
    let inv, execution, parent, callRef = 'c-call://u1/observed/' + label, parentCCallRef = 'c-call://u1/workflow/' + label;
    f.atCut(() => {
      inv = f.invocation(operating, { programRef: c2.programRef, graphFunctionRef: c2.graphFunctionRef,
        inputContractRef: c2.taskContractRef, rawInputDigest: hash(task), sourceResultBasis: null });
      execution = f.basisFor(operating, inv, task, { programRef: c2.programRef, graphFunctionRef: c2.graphFunctionRef });
      f.append('c_call_opened', 'c_call', callRef, { cCallRef: callRef, cCallDigest: hash(callRef), callClass: 'leaf' },
        { basisId: execution.basisRef, graphFunctionRef: c2.graphFunctionRef });
      f.append('c_call_fibre_selected', 'c_call', callRef, { cCallRef: callRef, callClass: 'leaf', armId: 'arm://u1/c2', regime: 'F_P',
        implementationRef: c2.implementationRef, implementationBindingRef: c2.implementationBindingRef }, { basisId: execution.basisRef, graphFunctionRef: c2.graphFunctionRef });
      parent = f.basisFor(operating, inv, state, { graphFunctionRef: p.governanceRef('graph-function', 'testing'),
        rawInputAdmissionRef: 'input://u1/' + label });
    });
    const scope = { basisId: parent.basisRef, graphFunctionRef: parent.graphFunctionRef, graphCallId: 'graph-call://u1/observed/' + label,
      frameId: 'frame://u1/observed/' + label }, prep = 'c-call://u1/prepare/' + label;
    let fibre, prepared;
    f.atCut(() => {
      const entered = f.append('traversal_cursor_entered', 'frame', scope.frameId,
        { cursorRef: 'cursor://u1/prepare/' + label, cursorDigest: hash('prepare/' + label), inputRef: parent.rawInputAdmissionRef, inputDigest: parent.rawInputDigest }, scope);
      const opened = f.append('c_call_opened', 'c_call', prep, { cCallRef: prep, cCallDigest: hash(prep), callClass: 'leaf',
        cursorRef: entered.payload.cursorRef, cursorDigest: entered.payload.cursorDigest }, { ...scope, causationEventRefs: [entered.eventId] });
      fibre = f.append('c_call_fibre_selected', 'c_call', prep, { cCallRef: prep, callClass: 'leaf', armId: 'arm://u1/prep', regime: 'F_D',
        implementationRef: p.governanceRef('implementation', 'prepare-testing'), implementationBindingRef: p.governanceRef('binding', 'prepare-testing') },
        { ...scope, causationEventRefs: [opened.eventId] });
    });
    prepared = admittedResult(f, task, { callRef: prep, contractRef: c2.taskContractRef, scope: { ...scope, causationEventRefs: [fibre.eventId] } });
    f.atCut(() => {
      const routeBody = { routeKind: 'advance', cCallRef: prep, judgmentRef: prepared.judgment.judgmentRef,
        targetCursorRef: 'cursor://u1/child/' + label, targetCursorDigest: hash('child/' + label) };
      const route = f.append('traversal_route_admitted', 'frame', scope.frameId,
        { ...routeBody, routeRef: 'route://u1/' + label, routeDigest: hash(routeBody) }, { ...scope, causationEventRefs: [prepared.judged.eventId] });
      f.append('c_call_opened', 'c_call', parentCCallRef, { cCallRef: parentCCallRef, cCallDigest: hash(parentCCallRef), callClass: 'workflow',
        childGraphFunctionRef: c2.graphFunctionRef, failureContractRef: c2.failureContractRef, judgmentPredicateRef: 'predicate://u1/workflow',
        cursorRef: routeBody.targetCursorRef, cursorDigest: routeBody.targetCursorDigest }, { ...scope, causationEventRefs: [route.eventId] });
    });
    checks.push({ path, differentBinding, task, callRef, parentCCallRef, parent, acquisitionEventRef: fibre.eventId, preparationResultRef: prepared.event.eventId });
  }
  const environment = { kind: 'exact_prefix_workspace_environment', workspaceAuthorityBasis: f.workspaceAuthorityBasis,
    workspaceBinding: f.workspaceBinding, productInstalls: [] };
  const executionOwner = await component('abg/execution_basis', {
    './environment_admission.js': { projectExactPrefixWorkspaceEnvironment: (_cut, binding) => ({ ...environment,
      workspaceBinding: binding.ref === workspaceBinding.bindingId ? workspaceBinding : f.workspaceBinding }) },
    './native_worksite_execution.js': { worksiteCommandSourcesInvalidatedAfter: trace.worksiteCommandSourcesInvalidatedAfter },
  });
  const provenanceOwner = await component('abg/worksite_input_provenance', {
    './native_worksite_execution.js': { worksiteCommandSourcesInvalidatedAfter: trace.worksiteCommandSourcesInvalidatedAfter },
  });
  const check = row => ({ c2: executionOwner.hasExactWorksiteCommandLeafSourceAtDurablePrefix(selectHeldEventStoreDurablePrefix(f.store), row.callRef, row.task),
    provenance: provenanceOwner.projectObservedWorksiteCommandChildAtPrefix(f.prefix(), { parentBasis: row.parent,
      parentCCallRef: row.parentCCallRef, runId: f.common.runId, task: row.task }) });
  for (const row of checks) { const value = observed("observed consumers", check(row)); assert.equal(value.c2, true, 'C2 owner must accept before cause');
    assert.equal(value.provenance?.acquisitionEvent.eventId, row.acquisitionEventRef); }
  const count = trace.calls.length; assert.equal(count, 6, 'both owners reached the actual invalidator for all three bindings/scopes');
  const foreignBasis = f.rows().find(e => e.kind === 'basis_admitted' && e.payload.workspaceBindingId !== f.workspaceBinding.bindingId && e.payload.rawInputValue?.kind === 'worksite_file_replace_request');
  assert.ok(foreignBasis);
  const foreignBefore = f.rows();
  const foreignCause = f.atCut(() => f.append('actor_process_termination_unconfirmed', 'process', f.processRef,
    { actorInvocationRef: f.actorRef, processRef: f.processRef }, { basisId: foreignBasis.basisId,
      parentAggregateId: f.actorRef, causationEventRefs: [f.process.eventId] }));
  assert.equal(projectNativeWorkUnknownEffectTask(foreignCause, foreignBefore), null, 'foreign basis cannot authenticate the native effect');
  for (const row of checks) { const value = observed("observed consumers", check(row)); assert.equal(value.c2, true); assert.ok(value.provenance); }
  assert.equal(trace.calls.length, 12); assert.ok(trace.calls.slice(6).every(c => c.result === false));
  const { event } = proveCause(f);
  for (const row of checks) { const value = observed("observed consumers", check(row)), unaffected = row.path === 'keep.txt';
    assert.equal(value.c2, unaffected); assert.equal(value.provenance !== null, unaffected);
    if (unaffected) assert.equal(value.provenance.preparationResult.eventId, row.preparationResultRef); }
  assert.equal(trace.calls.length, 18); assert.deepEqual(trace.calls.slice(12).map(c => c.result), [true, true, false, false, true, true]);
  results.push({ owner: 'execution_basis.hasExactWorksiteCommandLeafSourceAtDurablePrefix -> exactC2SourceEnvironment; worksite_input_provenance.projectObservedWorksiteCommandChildAtPrefix',
    case: 'paired observed C2 source and preparation provenance', causeEvent: event.eventId, foreignBasisCause: foreignCause.eventId,
    differentBindingSameRoot: { producerBinding: f.workspaceBinding.bindingId, laterConsumerBinding: workspaceBinding.bindingId, canonicalRoot: f.canonicalRoot }, trace: trace.calls,
    mapping: { before: [true, 'projection'], affectedAfter: [false, null], unaffectedAfter: [true, 'same preparation projection'] },
    lowerPremises: 'exact workspace installation environment supplied; actual Product observed tasks, EventStore admission, invocation/basis reconstruction, provenance and U1 invalidation' });
}

function synthesized(state, context, resultRef) {
  return { ...state, synthesis: { resultRef: 'result://u1/selection', resultDigest: hash('selection'),
    basis: { inputRef: 'input://u1/selection', inputDigest: hash(state), taskRef: state.original.taskRef,
      environmentRef: 'environment://u1', environmentDigest: hash('environment'), frameEvidenceDigest: hash('frame'),
      frameRefs: ['frame://u1'], contextRef: context.observationRef, previousResultRef: null },
    judgment: { interpretation: 'Selected source', contributions: [], gaps: [], nextGraphFunctionRef: p.governanceRef('graph-function', 'uat'),
      nextReason: 'Assess selected source', nextEvidenceRefs: [], subjectEvidenceRef: resultRef, revisionReason: 'Current evidence', revisionEvidenceRefs: [] } } };
}
async function governanceConsumers(t) {
  const f = await selected(t), trace = traced('consumer'), cases = [], assessedSources = new Map();
  const library = g.constructDefaultGovernanceLibraryModulePublication({ productId: p.ABI5_PRODUCT_ID, packageName: p.ABI5_PACKAGE_NAME,
    packageVersion: p.ABI5_PACKAGE_VERSION, artifactDigest: hash('artifact'), productContentDigest: hash('content'), productManifestDigest: hash('manifest') });
  let owned;
  const governanceRoots = new Map();
  // The one governance-root projection as built over the actual index; the
  // owned execution's ancestry to the governance root basis is the supplied
  // rehydration premise.
  const projection = await component('abg/semantic_job', {
    './execution_basis.js': { rehydrateExecutionBasisAtPrefix: (_prefix, ref) => governanceRoots.get(ref) ?? null } });
  const gate = await component('abg/default_library', {
    './semantic_job.js': { ...projection },
    './execution_basis.js': { authenticateOwnedNativeInstructionAssemblyBasis: () => owned },
    './native_worksite_execution.js': { worksiteCommandSourcesInvalidatedAfter: trace.worksiteCommandSourcesInvalidatedAfter,
      projectNativeWorkspaceWorkSourceAtPrefix: (prefix, value) => nativeOwner.projectNativeWorkspaceWorkSourceAtPrefix(prefix, value) ?? assessedSources.get(value.observationRef) ?? null,
      projectNativeWorkspaceWorkResultTaskAtPrefix: (prefix, event) => nativeOwner.projectNativeWorkspaceWorkResultTaskAtPrefix(prefix, event) ??
        assessedSources.get(event.payload?.value?.observationRef)?.sourceTask ?? null },
  });
  const environment = { kind: 'exact_prefix_workspace_environment', workspaceAuthorityBasis: f.workspaceAuthorityBasis,
    workspaceBinding: f.workspaceBinding, productInstalls: [] };
  for (const path of ['target.txt', 'keep.txt']) {
    const originalInput = await governanceInput(f, path), sourcePath = path + '.source', rubricPath = path + '.rubric';
    await fs.writeFile(join(f.canonicalRoot, sourcePath), 'Controlled complete source for ' + path + '\n');
    await fs.writeFile(join(f.canonicalRoot, rubricPath), 'Controlled independent consumer rubric for ' + path + '\n');
    const readRoots = [path, sourcePath, rubricPath];
    const operating = { workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding,
      capabilityGrant: f.capabilityGrant };
    const context = await product.observeWorksiteContext({ ...operating, readRoots, maxFiles: 30, maxBytes: 10000 });
    assert.equal(p.isWorksiteContextObservation(context), true);
    const asset = assetPath => {
      const entry = context.entries.find(e => e.relativePath === assetPath);
      assert.equal(entry?.state, 'file', 'assessment asset is physically present in the actual context');
      return { path: assetPath, digest: entry.digest };
    };
    const state = p.constructGovernanceWorkState({ ...originalInput.state.original,
      sources: [asset(sourcePath)], readRoots,
      workOrders: Object.fromEntries(Object.entries(originalInput.state.original.workOrders).map(([purpose, order]) =>
        [purpose, { ...order, readFirst: readRoots }])),
      assessment: { ...originalInput.state.original.assessment, sources: [sourcePath], candidatePath: path, rubricPath } });
    const task = p.constructNativeWorkspaceWorkTask({ ...operating, context, ...state.original.workOrders.construction });
    assert.equal(p.isNativeWorkspaceWorkTask(task), true);
    const native = await admitNativeSource(f, task, 'governance-' + path, { basisExtra: { rootImplementationSetRef: 'implementation-set://u1/governance/' + path } });
    const assessmentSelection = { resultContract: assessmentContract, schemaAsset: state.original.assessment.schemaAsset,
      sources: [asset(sourcePath)], candidate: asset(path), rubric: asset(rubricPath), producer: {
        resultRef: native.result.resultRef, resultDigest: native.result.resultDigest,
        cCallRef: native.event.aggregateId, actorInvocationRef: native.source.provenance.actorInvocationRef } };
    assert.equal(assessmentOwner.isNativeWorkspaceAssessmentSelection(assessmentSelection), true);
    assert.equal(assessmentOwner.nativeWorkspaceAssessmentSubjectMatches(assessmentSelection, context), true);
    const assessment = { kind: assessmentContract.valueKind, disposition: 'satisfied', reason: 'Controlled scalar verdict; no semantic UAT credit', unresolvedCriteria: [] };
    assert.deepEqual(assessmentOwner.parseNativeWorkspaceAssessmentResult(
      assessmentOwner.nativeWorkspaceAssessmentSchema(assessmentSelection), JSON.stringify(assessment)), assessment);
    const assessmentTask = p.constructNativeWorkspaceWorkTask({ ...operating, context, ...state.original.workOrders.uat,
      assessment: assessmentSelection });
    assert.equal(p.isNativeWorkspaceWorkTask(assessmentTask), true, 'complete typed assessment prerequisites hold before consumer gates');
    const root = f.atCut(() => f.basisFor(f, f.inv, state, { implementationSetRef: 'implementation-set://u1/governance/' + path }));
    const execution = { ...native.basis, rootImplementationSetRef: root.implementationSetRef, parentExecutionBasisRef: root.basisRef };
    governanceRoots.set(root.basisRef, { ...execution, basisRef: root.basisRef, parentExecutionBasisRef: null, rawInputValue: root.rawInputValue });
    const stateWithSource = synthesized({ ...state, observations: [{ purpose: 'construction', resultRef: native.result.resultRef,
      resultDigest: native.result.resultDigest, cCallRef: native.event.aggregateId, actorInvocationRef: native.source.provenance.actorInvocationRef,
      synthesisResultRef: 'result://u1/prior-selection', selectedGraphFunctionRef: p.governanceRef('graph-function', 'construction'),
      value: { report: native.source.report, changedPaths: native.source.changedPaths } }] }, context, native.result.resultRef);
    const setOwner = (input, operation) => {
      owned = { program: library.programs[0], prefix: f.prefix(), execution, environment, inputValue: input,
        inputRef: 'input://u1/governance/' + path, inputOrigin: {}, call: { runId: f.common.runId, implementationRef: p.governanceRef('implementation', operation) } };
    };
    const nativeBasis = { graphFunction: library.graphFunctions.find(row => row.declarations['abg.default_library_purpose'] === 'uat') };
    setOwner(stateWithSource, 'prepare-native');
    const uat = observed("governance source before", await gate.projectGovernanceNativeTask(nativeBasis, stateWithSource));
    assert.ok(p.isNativeWorkspaceWorkTask(uat), 'default source gate pre-cause output must be a valid native task');
    assert.deepEqual(uat.assessment, assessmentSelection);
    const provenance = { ...native.source.provenance, cCallRef: 'c-call://u1/assessment/' + path, actorInvocationRef: 'actor://u1/assessor/' + path };
    const assessed = constructNativeWorkspaceWorkObservation(uat, context, null, provenance, assessment);
    assert.equal(p.isNativeWorkspaceWorkObservation(assessed), true);
    const a = admittedResult(f, assessed, { callRef: provenance.cCallRef, contractRef: ids.observationContractRef,
      scope: { basisId: native.basis.basisRef } });
    // Only the independent assessment producer's prior-source provenance is a
    // supplied lower premise. Its immutable Product observation and actual
    // admitted Result remain exact; no assessment actor or verifier ran here.
    assessedSources.set(assessed.observationRef, { sourceBasis: native.basis, sourceTask: uat });
    const parentInput = { ...stateWithSource, observations: [...stateWithSource.observations, { purpose: 'uat', resultRef: a.result.resultRef,
      resultDigest: a.result.resultDigest, cCallRef: a.event.aggregateId, actorInvocationRef: provenance.actorInvocationRef,
      synthesisResultRef: 'result://u1/selection', selectedGraphFunctionRef: p.governanceRef('graph-function', 'uat'), value: assessment }] };
    assert.equal(p.isGovernanceWorkState(parentInput), true);
    setOwner(parentInput, 'evaluate-parent');
    assert.equal(observed('governance parent before', gate.projectGovernanceParent(nativeBasis, parentInput))?.terminal, true, 'parent pre-cause scalar gate must be eligible');
    cases.push({ path, setOwner, nativeBasis, stateWithSource, parentInput, uat });
  }
  const beforeCalls = trace.calls.length; assert.equal(beforeCalls, 4); assert.ok(trace.calls.every(c => c.result === false));
  const { event } = proveCause(f);
  for (const c of cases) {
    c.setOwner(c.stateWithSource, 'prepare-native');
    const task = observed("governance source after", await gate.projectGovernanceNativeTask(c.nativeBasis, c.stateWithSource));
    c.setOwner(c.parentInput, 'evaluate-parent'); const parent = observed("governance parent after", gate.projectGovernanceParent(c.nativeBasis, c.parentInput));
    assert.ok(parent, 'parent retains attributed history even when terminal eligibility is withdrawn');
    if (c.path === 'target.txt') { assert.equal(task, null); assert.equal(parent.terminal, false); assert.deepEqual(parent.unresolvedSupportRefs, c.parentInput.original.requiredSupportRefs); }
    else { assert.deepEqual(task, c.uat); assert.equal(parent.terminal, true); assert.deepEqual(parent.unresolvedSupportRefs, []); }
  }
  assert.equal(trace.calls.length, 8); assert.deepEqual(trace.calls.slice(4).map(c => c.result), [true, true, false, false]);
  results.push({ owner: 'default_library source gate 187 and parent gate 310', case: 'paired governance dependencies', causeEvent: event.eventId,
    trace: trace.calls, mapping: { before: ['native task', 'terminal true'], affectedAfter: [null, 'terminal false with original unresolved supports'], unaffectedAfter: ['same task', 'terminal true'] },
    lowerPremises: 'constructed occurrence and installed environment; source gate uses actual verified native-source join; parent uses supplied assessed-source provenance with actual Product assessment observation/ABG Result, no semantic assessment or installed native claim' });
}

import * as semantic from '../../build/code/src/product/semantic_job.js';
import * as revisionProduct from '../../build/code/src/product/semantic_revision.js';
import { SEMANTIC_REVISION_IDS as R } from '../../build/code/src/gtl/semantic_revision_identity.js';
import { observationFor } from '../support/forward-observation-carrier.mjs';
const D = g.SEMANTIC_STAGE_IDS;
const coordinateOf = state => ({ cCallRef: state.cCall.cCallRef, resultRef: state.result.resultRef, resultDigest: state.result.resultDigest,
  resultAdmissionEventRef: state.result.admissionEventRef, judgmentEventRef: state.judgment.admissionEventRef });
async function semanticData(t, roots) {
  const helpers = await semanticFixtureHelpers(), env = await helpers.fixture(preserveOnFailure(t));
  attempts.push({ ...env });
  checkedHandoff('semanticFixtureHelpers', helpers, ['fixture', 'author', 'assess', 'candidate', 'verdict', 'provenance'],
    ['declaration', 'publication', 'declaredPublication']);
  checkedHandoff('semanticFixtureHelpers.fixture', env, ['observe'],
    ['workspaceAuthorityBasis', 'workspaceBinding', 'capabilityGrant', 'canonicalRoot', 'job', 'envelope']);
  const job = p.constructSemanticJobInput({ ...env.job, worksiteScope: { ...env.job.worksiteScope,
    readRoots: ['assets', 'app', ...env.job.members.map(m => m.path)] } });
  env.job = job;
  const observe = async (operating, readRoots, label) => {
    const context = await product.observeWorksiteContext({ workspaceAuthorityBasis: operating.workspaceAuthorityBasis,
      workspaceBinding: operating.workspaceBinding, readRoots,
      maxFiles: helpers.declaration.bounds.maxContextFiles, maxBytes: helpers.declaration.bounds.maxContextBytes });
    contextChecks.push({ label, declarationRef: helpers.declaration.declarationRef, bounds: helpers.declaration.bounds, context });
    assert.equal(p.isWorksiteContextObservation(context), true, 'complete declaration-bounded semantic context: ' + JSON.stringify(context));
    assert.equal(context.maxFiles, helpers.declaration.bounds.maxContextFiles);
    assert.equal(context.maxBytes, helpers.declaration.bounds.maxContextBytes);
    assert.deepEqual(context.readRoots, readRoots);
    assert.ok(context.entries.length <= context.maxFiles);
    assert.ok(context.entries.reduce((total, entry) => total + (entry.state === 'file' ? entry.byteLength : 0), 0) <= context.maxBytes);
    return context;
  };
  env.observe = () => observe(env, job.worksiteScope.readRoots, 'semantic consumer context');
  const f = await selected(t, roots, { environment: env, taskFactory: async operating => {
    const context = await observe(operating, ['.'], 'unknown-effect cause task context');
    const task = p.constructNativeWorkspaceWorkTask({ workspaceAuthorityBasis: operating.workspaceAuthorityBasis,
      workspaceBinding: operating.workspaceBinding, capabilityGrant: operating.capabilityGrant, context,
      outcome: 'Bounded unknown-effect currentness premise', instructions: ['Use only the declared cause write scope.'],
      readFirst: ['target.txt'], writeRoots: roots, checks: [] });
    assert.equal(p.isNativeWorkspaceWorkTask(task), true);
    assert.deepEqual(task.writeRoots, roots);
    return task;
  } });
  const envelope = p.constructSemanticJobEnvelope(job, helpers.declaration, { invocationAdmissionRef: f.inv.invocationAdmissionRef,
    rootExecutionBasisRef: 'basis://u1/semantic-root', rootInputRef: 'input://u1/semantic-root', rootInputDigest: hash(job),
    intakeCCallRef: 'c-call://u1/semantic-intake', intakeCCallDigest: hash('semantic-intake'), intakeExecutionBasisRef: 'basis://u1/semantic-root' });
  env.envelope = envelope;
  return { helpers, env, f, envelope };
}
async function semanticOwnerHarness(data) {
  const { f, env, helpers, envelope } = data, trace = traced('consumer'), states = new Map(), bases = new Map();
  const root = { ...f.basis, basisRef: envelope.basis.rootExecutionBasisRef, basisDigest: hash('controlled-semantic-root'),
    parentExecutionBasisRef: null, rawInputValue: env.job, rawInputDigest: hash(env.job), rawInputAdmissionRef: envelope.basis.rootInputRef };
  bases.set(root.basisRef, root);
  // An invocation key reads the admission events of the root bases this harness
  // admits, the index premise of the one governance-root projection; a consumer
  // whose execution is its own root admits it under its own invocation.
  const admittedRoots = [root];
  const rootAdmissions = key => admittedRoots.filter(b => 'invocation:' + b.invocationRef === key).map(b => ({ kind: 'basis_admitted',
    payload: { basisClass: 'root', basisRef: b.basisRef, invocationAdmissionRef: b.invocationAdmissionRef, implementationSetRef: b.rootImplementationSetRef, rawInputValue: b.rawInputValue } }));
  const pub = helpers.declaredPublication;
  const environment = { kind: 'exact_prefix_workspace_environment', workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding,
    productInstalls: [{ productId: pub.owningProductId, artifactDigest: pub.artifactDigest, productContentDigest: pub.productContentDigest,
      manifestDigest: pub.productManifestDigest, installedRoot: env.scratch,
      contributionManifest: { publicationBindings: [{ moduleRef: pub.moduleRef, publicationDigest: p.modulePublicationSemanticDigest(pub) }] } }] };
  let owned;
  const basis = { publication: pub, lifecyclePublication: pub, sourcePublication: pub, declarationGraphFunctions: [], graphFunction: { declarations: {} } };
  const lookup = (_prefix, _events, _publication, ref) => states.get(ref) ?? null;
  const leaf = (_prefix, coordinate) => { const state = states.get(coordinate.cCallRef); return state && hash(coordinateOf(state)) === hash(coordinate) ? state : null; };
  const executionOverrides = { authenticateOwnedNativeInstructionAssemblyBasis: () => owned,
    rehydrateExecutionBasisAtPrefix: (_prefix, ref) => bases.get(ref) ?? null };
  const owner = await component('abg/semantic_job', {
    './execution_basis.js': executionOverrides,
    './event_prefix.js': { indexedRuntimeEvents: (prefix, key) => key.startsWith('invocation:') ? rootAdmissions(key) : prefixes.indexedRuntimeEvents(prefix, key) },
    './invocation_admission.js': { rehydrateInvocationAdmissionAtPrefix: () => ({ capabilityGrants: [f.capabilityGrant] }) },
    '../gtl/semantic_job.js': { validSemanticJobProgramOwners: () => true },
    './semantic_stage.js': { projectSemanticPredecessorAtPrefix: lookup },
    './worksite_revision.js': { projectWorksiteRevisionNativeResult: leaf },
    './native_worksite_execution.js': { worksiteCommandSourcesInvalidatedAfter: trace.worksiteCommandSourcesInvalidatedAfter },
  });
  const admit = (value, implementationRef, callRef, execution = root, options = {}) => {
    const a = admittedResult(f, value, { callRef, contractRef: D.envelopeContractRef, ...options,
      scope: { basisId: execution.basisRef, ...(options.scope ?? {}) } });
    const state = { cCall: { ...f.cCall, cCallRef: callRef, basisId: execution.basisRef, runId: options.scope?.runId ?? f.common.runId,
      implementationRef, regime: 'F_D' }, result: a.result, judgment: a.judgment };
    states.set(callRef, state); return { state, ...a };
  };
  const setOwner = (input, implementationRef, { stage, execution = root, callRef = 'c-call://u1/semantic-consumer', openedEventRef } = {}) => {
    basis.graphFunction = { declarations: stage === undefined ? {} : { 'abg.semantic_native_stage': stage.declarationRef } };
    owned = { prefix: f.prefix(), execution, inputValue: input, inputDigest: hash(input), inputRef: 'input://u1/semantic-consumer', program: {}, environment,
      call: { ...f.cCall, cCallRef: callRef, basisId: execution.basisRef, runId: f.common.runId, regime: 'F_D', implementationRef,
        programLocusRef: stage?.authorLocusRef ?? f.cCall.programLocusRef, openedEventRef: openedEventRef ?? 'event://u1/consumer-open' } };
    return owned;
  };
  return { owner, trace, basis, root, environment, states, bases, admittedRoots, lookup, leaf, executionOverrides, admit, setOwner, get owned() { return owned; } };
}

async function semanticFoldConsumer(t) {
  for (const [label, roots, affected] of [['affected', ['assets'], true], ['sibling', ['target.txt'], false]]) {
    const data = await semanticData(t, roots), { f, env, helpers, envelope } = data, h = await semanticOwnerHarness(data);
    h.admit(envelope, D.jobIntakeImplementationRef, envelope.basis.intakeCCallRef);
    const authored = await helpers.author(env, envelope, 0);
    const source = await admitNativeSource(f, authored.task, 'semantic-' + label,
      { after: authored.observation.after, report: authored.observation.report });
    const input = p.constructRetainedGraphInput(envelope, source.source), stage = helpers.declaration.stages[0];
    const opened = f.atCut(() => f.append('c_call_opened', 'c_call', 'c-call://u1/semantic-consumer',
      { cCallRef: 'c-call://u1/semantic-consumer', cCallDigest: hash('consumer'), callClass: 'leaf' }));
    const set = () => h.setOwner(input, D.nativeAuthorFoldImplementationRef, { stage, openedEventRef: opened.eventId });
    set(); const before = observed("semantic fold before", h.owner.projectNativeSemanticFold(h.basis, input));
    assert.ok(p.isSemanticJobEnvelope(before), 'actual semantic fold accepts prior source before U1');
    assert.equal(h.trace.calls.length, 1); assert.equal(h.trace.calls[0].result, false);
    const { event } = proveCause(f); set(); const after = observed("semantic fold after", h.owner.projectNativeSemanticFold(h.basis, input));
    assert.equal(h.trace.calls.length, 2); assert.equal(h.trace.calls[1].result, affected);
    if (affected) assert.equal(after, null); else assert.deepEqual(after, before);
    results.push({ owner: 'semantic_job.nativeStageSource -> projectNativeSemanticFold', case: label,
      causeEvent: event.eventId, before: 'valid SemanticJobEnvelope', after: affected ? null : 'same SemanticJobEnvelope', trace: h.trace.calls,
      lowerPremises: 'source-owned semantic fixture candidates, installed Program/occurrence/predecessor authentication supplied; actual raw native verifier/source join/Product fold/EventStore/U1 invalidator; no semantic author actor or acceptance' });
  }
}

async function revisionIntakeConsumer(t) {
  for (const [label, roots, affected] of [['affected', ['assets'], true], ['sibling', ['target.txt'], false]]) {
    const data = await semanticData(t, roots), { f, env, helpers, envelope } = data, h = await semanticOwnerHarness(data);
    const parent = h.admit(envelope, D.jobIntakeImplementationRef, envelope.basis.intakeCCallRef);
    const a = await helpers.author(env, envelope, 0), rejected = helpers.assess(env, a.authored, 0, 'falsified').assessed;
    const cause = h.admit(rejected, D.nativeAssessorFoldImplementationRef, rejected.assets[0].assessment.source.nativeWork.adapterCCallRef,
      h.root, { judgment: 'stop' });
    const sourceRun = { ref: f.common.runId, digest: hash('controlled-source-run') };
    const intake = { kind: 'native_semantic_revision_intake', schemaVersion: '5.0.0', sourceRun,
      sourcePrefix: clone(selectHeldEventStoreDurablePrefix(f.store)) };
    assert.equal(revisionProduct.isNativeSemanticRevisionIntake(intake), true);
    const execution = { ...h.root, basisRef: 'basis://u1/revision-intake', invocationRef: 'invocation://u1/revision-intake', rawInputValue: intake, rawInputDigest: hash(intake),
      rawInputAdmissionRef: 'input://u1/revision-intake' }; h.bases.set(execution.basisRef, execution); h.admittedRoots.push(execution);
    const revision = await component('abg/semantic_revision', {
      './execution_basis.js': h.executionOverrides,
      './semantic_job.js': h.owner,
      './replay.js': { projectRunIdentityAtPrefix: (_prefix, ref) => ref === sourceRun.ref ? { run: sourceRun, executionBasis: { ref: h.root.basisRef } } : null },
      './environment_admission.js': { projectExactPrefixWorkspaceEnvironment: () => h.environment },
      './invocation_admission.js': { rehydrateInvocationAdmissionAtPrefix: () => ({ capabilityGrants: [f.capabilityGrant] }) },
      './worksite_revision.js': { projectWorksiteRevisionNativeResult: h.leaf, projectWorksiteRevisionBindingCover: () => [] },
      './native_worksite_execution.js': { worksiteCommandSourcesInvalidatedAfter: h.trace.worksiteCommandSourcesInvalidatedAfter },
    });
    const set = () => { h.setOwner(intake, R.nativeIntakeImplementationRef, { execution }); h.basis.predecessorPrefix = selectHeldEventStoreDurablePrefix(f.store); };
    const limits = { inactivityTimeoutMs: 300000, absoluteTimeoutMs: 900000 };
    set(); let reason = null;
    const before = await revision.prepareNativeSemanticRevisionIntake(h.basis, intake, limits, r => { reason = r; });
    observed('revision intake before', before);
    assert.ok(revisionProduct.isSemanticRevisionSelectionInput(before), 'intake positive must reach valid selection input: ' + reason);
    assert.deepEqual(before.parent, coordinateOf(parent.state)); assert.deepEqual(before.causes, [coordinateOf(cause.state)]);
    assert.equal(h.trace.calls.length, 1); assert.equal(h.trace.calls[0].result, false);
    const unknown = proveCause(f); set(); reason = null;
    const after = await revision.prepareNativeSemanticRevisionIntake(h.basis, intake, limits, r => { reason = r; });
    observed('revision intake after', { after, reason });
    assert.equal(h.trace.calls.length, 2); assert.equal(h.trace.calls[1].result, affected);
    if (affected) { assert.equal(after, null); assert.equal(reason, 'native_revision_source_invalidated'); }
    else { assert.deepEqual(after, before); assert.equal(reason, null); }
    results.push({ owner: 'semantic_revision.nativeIntakeFacts -> prepareNativeSemanticRevisionIntake', case: label,
      causeEvent: unknown.event.eventId, sourcePrefix: intake.sourcePrefix, before: 'valid selection input',
      after: affected ? 'native_revision_source_invalidated' : 'same selection input', trace: h.trace.calls,
      lowerPremises: 'source Run identity, exact leaf projections, original execution root and installed environment/binding cover supplied; actual durable ancestry, EventStore Result/judgment, source Product constructors, current context acquisition and U1 invalidation' });
  }
}

async function revisionEvidenceConsumer(t) {
  for (const [label, roots, affected] of [['affected', ['app/main.mjs'], true], ['sibling', ['target.txt'], false]]) {
    const data = await semanticData(t, roots), { f, env, helpers, envelope } = data, h = await semanticOwnerHarness(data);
    h.admit(envelope, D.jobIntakeImplementationRef, envelope.basis.intakeCCallRef);
    let design = envelope;
    for (let i = 0; i < 4; i++) {
      const author = await helpers.author(env, design, i);
      h.admit(author.authored, D.nativeAuthorFoldImplementationRef, author.authored.assets.at(-1).source.nativeWork.adapterCCallRef);
      design = helpers.assess(env, author.authored, i).assessed;
      h.admit(design, D.nativeAssessorFoldImplementationRef, design.assets.at(-1).assessment.source.nativeWork.adapterCCallRef);
    }
    const task = semantic.constructNativeSemanticConstructionTask(design, f, await env.observe());
    await fs.mkdir(join(f.canonicalRoot, 'app'), { recursive: true });
    await fs.writeFile(join(f.canonicalRoot, 'app/main.mjs'), 'export const controlled = true;\n');
    await fs.writeFile(join(f.canonicalRoot, 'app/check.mjs'), '/* supplied command premise; no command launched */\n');
    const construction = await admitNativeSource(f, task, 'construction-' + label, { after: await env.observe() });
    const commandTask = semantic.constructNativeSemanticExecutionTask(design, construction.source, task);
    const command = observationFor(commandTask, 0).observation;
    assert.equal(p.isNativeWorksiteCommandExecutionObservation(command), true);
    const commandState = h.admit(command, p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef, 'c-call://u1/command-result');
    const input = p.constructRetainedGraphInput(design, command);
    h.setOwner(input, D.nativeEvidenceImplementationRef);
    const evidence = h.owner.projectNativeSemanticEvidence(h.basis, input);
    assert.ok(p.isSemanticJobEnvelope(evidence)); assert.ok(evidence.evidence, 'actual semantic evidence owner produces the retained evidence');
    const parent = h.admit(evidence, D.nativeEvidenceImplementationRef, 'c-call://u1/evidence-parent');
    // A controlled assessment cause is a lower semantic premise, with a typed
    // actual Product envelope. It is not a new native actor or verdict claim.
    const a = await helpers.author(env, evidence, 4), rejected = helpers.assess(env, a.authored, 4, 'falsified').assessed;
    const cause = h.admit(rejected, D.nativeAssessorFoldImplementationRef, rejected.assets.at(-1).assessment.source.nativeWork.adapterCCallRef,
      h.root, { judgment: 'stop' });
    const source = { kind: 'native_semantic_revision_intake', schemaVersion: '5.0.0', sourceRun: { ref: f.common.runId, digest: hash('source-run') },
      sourcePrefix: clone(selectHeldEventStoreDurablePrefix(f.store)) };
    const request = deepFreeze({ kind: 'semantic_revision_selection_input', schemaVersion: '5.0.0', parent: coordinateOf(parent.state), causes: [coordinateOf(cause.state)],
      currentWorksite: null, nativeWorksite: { kind: 'native_semantic_revision_worksite', workspaceAuthorityBasis: f.workspaceAuthorityBasis,
        workspaceBinding: f.workspaceBinding, capabilityGrant: f.capabilityGrant, context: await env.observe(),
        commandExecutionLimits: { inactivityTimeoutMs: 300000, absoluteTimeoutMs: 900000 }, construction: null, source } });
    assert.equal(revisionProduct.isSemanticRevisionSelectionInput(request), true);
    const acquisitionBasis = { ...h.root, basisRef: 'basis://u1/acquisition', rawInputValue: source, rawInputDigest: hash(source) };
    h.bases.set(acquisitionBasis.basisRef, acquisitionBasis);
    const acquired = h.admit(request, R.nativeIntakeImplementationRef, 'c-call://u1/acquired', acquisitionBasis);
    const execution = { ...h.root, basisRef: 'basis://u1/selection', invocationRef: 'invocation://u1/selection', rawInputValue: request, rawInputDigest: hash(request) };
    h.bases.set(execution.basisRef, execution); h.admittedRoots.push(execution);
    const revision = await component('abg/semantic_revision', {
      './execution_basis.js': h.executionOverrides,
      './semantic_job.js': h.owner,
      './semantic_stage.js': { selectedSemanticPredecessor: (_basis, impl, value) => impl === R.nativeIntakeImplementationRef && hash(value) === hash(request)
        ? { previous: acquired.state, execution: acquisitionBasis, event: acquired.event } : null },
      './worksite_revision.js': { projectWorksiteRevisionNativeResult: h.leaf },
      './native_worksite_execution.js': { worksiteCommandSourcesInvalidatedAfter: h.trace.worksiteCommandSourcesInvalidatedAfter },
    });
    const set = () => h.setOwner(request, R.selectionImplementationRef, { execution });
    set(); const before = revision.projectOwnedJobRevisionSubject(h.basis, request);
    observed('revision subject before', before === null ? null : { envelope: before.envelope, request: before.request, acquisition: before.acquisition });
    assert.ok(before, 'actual retained-evidence subject must accept before cause');
    assert.deepEqual(before.envelope.evidence, evidence.evidence); assert.equal(before.acquisition.result.admissionEventRef, acquired.event.eventId);
    assert.equal(h.trace.calls.length, 1); assert.equal(h.trace.calls[0].afterOrdinal, acquired.event.admissionOrdinal);
    const unknown = proveCause(f); set(); const after = revision.projectOwnedJobRevisionSubject(h.basis, request);
    observed("revision subject after", after === null ? null : { envelope: after.envelope, request: after.request, acquisition: after.acquisition });
    assert.equal(h.trace.calls.length, 2); assert.equal(h.trace.calls[1].result, affected);
    if (affected) assert.equal(after, null); else { assert.ok(after); assert.deepEqual(after.envelope, before.envelope); assert.deepEqual(after.acquisition, before.acquisition); }
    results.push({ owner: 'semantic_revision.nativeJobRevisionSubject -> projectOwnedJobRevisionSubject', case: label,
      causeEvent: unknown.event.eventId, acquisitionEvent: acquired.event.eventId, evidenceResult: parent.event.eventId,
      commandResult: commandState.event.eventId, before: 'authenticated retained-evidence subject', after: affected ? null : 'same retained evidence and acquisition', trace: h.trace.calls,
      lowerPremises: 'Program/occurrence/leaf and acquisition matching supplied; actual Product semantic construction/source verifier/source join and evidence owner, actual EventStore Result/judgment; command observationFor is a disclosed typed helper premise, not command execution; no installed native credit' });
  }
}

// One sequential test makes the first unexpected integration failure stop all
// dependent cases. Inputs and the actual prefix are retained before after-hooks.
test('U1-P5-02 actual C0 successor and every affected currentness consumer', async t => {
  try {
    const cases = { c0: c0Success, observed: observedConsumers, governance: governanceConsumers,
      semanticFold: semanticFoldConsumer, revisionIntake: revisionIntakeConsumer, revisionEvidence: revisionEvidenceConsumer };
    for (const name of selectedCases) await cases[name](t);
    await retain();
    proofSucceeded = true;
    t.diagnostic(JSON.stringify(results.map(({ owner, case: name, before, after, mapping }) => ({ owner, case: name, before, after, mapping }))));
  } catch (error) {
    results.push({ firstFailure: { name: error.name, message: error.message, stack: error.stack }, dependentCasesStopped: true });
    await retain(); throw error;
  }
});

// U1-PHYSICAL-SCOPE-SUCCESSOR-01: independent retention state keeps the earlier
// consumer population unchanged and preserves this first failing frontier.
test('U1 physical target scope successor across bindings and native Result scopes', async t => {
  const localFixtures = [], localAttempts = [], records = [], physicalEffects = [], cleanup = [];
  const retention = async () => {
    if (!process.env.ABG_U1_EVIDENCE_DIR) return;
    await fs.mkdir(process.env.ABG_U1_EVIDENCE_DIR, { recursive: true });
    await fs.writeFile(join(process.env.ABG_U1_EVIDENCE_DIR, 'physical-scope-results.json'), JSON.stringify({
      activation: 'U1-C0-PHYSICAL-CURRENTNESS-01', records, physicalEffects,
      cleanup: 'fixture roots retained; append owners close only after final evidence', nativeOrCommandActorsLaunched: 0,
      lowerPremises: 'Controlled cold installation/binding/Program and native occurrence facts. Actual Product observations/validation, raw verifier, C0 physical effects and EventStore admission. No installed/native execution claim.',
      attempts: await Promise.all(localAttempts.map(async a => ({ scratch: a.scratch, canonicalRoot: a.canonicalRoot,
        otherScratch: a.otherScratch, prefix: a.rows ? a.rows() : null, candidates: a.candidates ?? null,
        journal: await retainedJournal(a.store), physical: await physicalInventory(a.canonicalRoot) }))),
    }, null, 2) + '\n');
  };
  const capture = async (label, value) => { records.push({ label, ...value }); await retention(); };
  const make = async (roots, options = {}) => {
    const f = await createU1Fixture({ after(callback) { cleanup.push(callback); } }, roots,
      { ...options, onAttempt: attempt => localAttempts.push(attempt) });
    localFixtures.push(f); return f;
  };
  const rebound = f => {
    const { kind, schemaVersion, bindingId, bindingDigest, admissionEventRef, ...body } = f.workspaceBinding;
    const next = { ...body, productSetId: 'product-set://u1/physical-scope-b2', productSetDigest: hash('physical-scope-b2') };
    const digest = hash(next), workspaceBinding = { kind: 'workspace_binding', schemaVersion: '5.0.0',
      bindingId: identity('workspace-binding', digest), bindingDigest: digest, ...next,
      admissionEventRef: 'event://u1/controlled-physical-scope-binding' };
    const { kind: gk, schemaVersion: gv, grantRef, grantDigest, ...grantBody } = f.capabilityGrant;
    const g2 = { ...grantBody, scopeRef: workspaceBinding.bindingId, scopeDigest: digest }, gd = hash(g2);
    return { workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding, canonicalRoot: f.canonicalRoot,
      capabilityGrant: { kind: 'capability_grant', schemaVersion: '5.0.0', grantRef: identity('capability-grant', gd), grantDigest: gd, ...g2 } };
  };
  const addTargets = async (f, paths) => {
    const env = rebound(f), invocation = f.atCut(() => f.invocation(env)), targets = [];
    const territory = product.constructWorksiteTerritory({ ...env, relativeRoot: '.', territoryUri: pathToFileURL(f.canonicalRoot).href });
    for (const path of paths) {
      const subject = product.constructWorksiteSubject({ ...env, relativePath: path, subjectUri: pathToFileURL(join(f.canonicalRoot, path)).href });
      const predecessorObservation = await product.observeWorksiteSubject(env.workspaceAuthorityBasis, env.workspaceBinding, subject);
      const request = product.constructWorksiteFileReplaceRequest({ ...env, territory, subject, predecessorObservation,
        replacementBytes: Buffer.from('candidate\n') });
      await capture('b2 Product request', { request, binding: env.workspaceBinding });
      assert.equal(product.isWorksiteFileReplaceRequest(request), true, JSON.stringify(request));
      assert.notEqual(request.workspaceBindingIdentity, f.task.workspaceBinding.bindingId);
      assert.equal(request.workspaceAuthorityBasis.canonicalRoot, f.task.workspaceAuthorityBasis.canonicalRoot);
      const basis = f.atCut(() => f.basisFor(env, invocation, request));
      targets.push({ request, basis });
    }
    return { env, invocation, targets };
  };
  const observation = (label, request) => ({ label, value: request.predecessorObservation,
    root: request.workspaceAuthorityBasis.canonicalRoot, path: request.subject.relativePath });
  const controls = f => [observation('b1 target', f.requests.find(r => r.subject.relativePath === 'target.txt')),
    observation('same-root sibling', f.requests.find(r => r.subject.relativePath === 'keep.txt')),
    observation('other-root target', f.foreign)];
  const views = async (f, label, selected) => {
    const prefix = f.prefix(), rows = f.rows(), coordinate = clone(selectHeldEventStoreDurablePrefix(f.store));
    const warm = calculus.deriveRuntimeEventCalculusProjection(prefix);
    const full = calculus.deriveRuntimeEventCalculusProjection(prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(clone(rows))));
    // Cloned coordinate has no nominal active-owner receipt; this takes the
    // physical cold reader and its lazy owned prefix, even while append is held.
    const coldPrefix = prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(deepFreeze(clone(coordinate)), { requireCurrent: true });
    const cold = calculus.deriveRuntimeEventCalculusProjection(coldPrefix);
    const facts = selected.map(o => ({ label: o.label, observationRef: o.value.observationRef,
      indexed: current(warm, o.value), full: current(full, o.value), coldLazy: current(cold, o.value) }));
    await capture(label, { coordinate, facts, modes: ['warm indexed/incremental', 'full immutable', 'cold physical/lazy owned'] });
    assert.deepEqual(warm, full); assert.deepEqual(cold, warm);
    return { prefix, rows, coordinate, projection: warm, facts };
  };
  const gateViews = (f, afterOrdinal, selected) => {
    const warm = f.prefix(), full = prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(clone(f.rows())));
    const cold = prefixes.readOwnedRuntimeEventPrefixAtDurablePrefix(deepFreeze(clone(selectHeldEventStoreDurablePrefix(f.store))), { requireCurrent: true });
    return selected.map(o => ({ label: o.label, indexed: nativeOwner.worksiteCommandSourcesInvalidatedAfter(warm, afterOrdinal, o.root, [o.path]),
      full: nativeOwner.worksiteCommandSourcesInvalidatedAfter(full, afterOrdinal, o.root, [o.path]),
      coldLazy: nativeOwner.worksiteCommandSourcesInvalidatedAfter(cold, afterOrdinal, o.root, [o.path]) }));
  };
  const causeAfter = async (f, label, selected, expected, before, expectedGates = expected.map(value => !value)) => {
    const event = f.cause(), dependencies = calculus.eventCalculusDependencies(f.prefix(), event);
    const task = projectNativeWorkUnknownEffectTask(event, dependencies, before.prefix);
    const after = await views(f, label, selected);
    const gates = selected.map(o => ({ label: o.label, invalidated: nativeOwner.worksiteCommandSourcesInvalidatedAfter(
      f.prefix(), before.rows.at(-1).admissionOrdinal, o.root, [o.path]) }));
    await capture(label + ' authenticated cause', { event, task, gates, retired: calculus.projectNativeWorkRetiredObservations(event, before.rows) });
    assert.deepEqual(task, f.task);
    for (let i = 0; i < selected.length; i++) {
      assert.equal(after.facts[i].indexed, expected[i], selected[i].label);
      assert.equal(gates[i].invalidated, expectedGates[i], selected[i].label + ' native gate');
    }
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(before.prefix), before.projection, 'historical prefix is unchanged');
    assert.equal(after.rows.length, before.rows.length + 1, 'unknown cause alone creates no Result or observation');
    return after;
  };
  const commitC0 = async (f, b2, label, expectedBytes = 'candidate\n') => {
    const request = b2.targets[0].request;
    const execution = f.atCut(() => f.basisFor(b2.env, b2.invocation, request, {
      graphFunctionRef: f.executionBasis.graphFunctionRef, graphFunctionDigest: f.executionBasis.graphFunctionDigest,
      implementationSetRef: f.implementationSet.implementationSetRef, implementationSetDigest: f.implementationSet.implementationSetDigest }));
    const executionBasis = { kind: 'execution_basis', schemaVersion: '5.0.0', disposition: 'admitted', ...execution };
    const callBody = { basisId: execution.basisRef, graphCallId: 'graph-call://u1/' + label, frameId: 'frame://u1/' + label,
      vectorIndex: 0, stageRole: 'file-replace', taskOrdinal: null, attempt: 1, programLocusRef: f.cCall.programLocusRef, retryPath: [] };
    const cCallDigest = hash(callBody), cCall = { ...f.cCall, ...callBody, cCallRef: `c-call:${cCallDigest}`, cCallDigest };
    const authorization = product.constructWorksiteEffectAuthorization({ ...f, ...b2.env, executionBasis, cCall, request });
    const input = { workspaceAuthorityBasis: b2.env.workspaceAuthorityBasis, workspaceBinding: b2.env.workspaceBinding,
      implementationSet: f.implementationSet, executionBasis, cCall, request, authorization };
    await capture(label + ' C0 input', { input });
    assert.equal(product.isWorksiteFileReplaceInput(input), true, JSON.stringify(authorization));
    const prior = await views(f, label + ' before physical C0', [observation('b2 predecessor', request), ...controls(f)]);
    const physicalPrefix = clone(selectHeldEventStoreDurablePrefix(f.store)), physical = await product.replaceWorksiteFile(input);
    physicalEffects.push({ label, owner: 'replaceWorksiteFile', input, physicalPrefix, physical }); await retention();
    assert.equal(physical.kind, 'worksite_file_replace_result'); assert.equal(physical.disposition, 'committed');
    assert.equal(await fs.readFile(join(f.canonicalRoot, 'target.txt'), 'utf8'), expectedBytes);
    assert.deepEqual(selectHeldEventStoreDurablePrefix(f.store), physicalPrefix);
    assert.equal(current(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), physical.successorObservation), false);
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), prior.projection,
      'physical effect alone does not author projection truth');
    const scope = { basisId: execution.basisRef, graphFunctionRef: execution.graphFunctionRef,
      graphCallId: callBody.graphCallId, frameId: callBody.frameId };
    const output = { kind: 'worksite_file_replace_output', schemaVersion: '5.0.0', authorization,
      receipt: physical.receipt, successorObservation: physical.successorObservation };
    const evidence = f.atCut(() => {
      const opened = f.append('c_call_opened', 'c_call', cCall.cCallRef,
        { cCallRef: cCall.cCallRef, cCallDigest, callClass: 'leaf', programLocusRef: cCall.programLocusRef }, scope);
      const fibre = f.append('c_call_fibre_selected', 'c_call', cCall.cCallRef,
        { cCallRef: cCall.cCallRef, callClass: 'leaf', armId: 'arm://u1/c0', regime: 'F_D',
          implementationRef: cCall.implementationRef, implementationBindingRef: cCall.implementationBindingRef },
        { ...scope, causationEventRefs: [opened.eventId] });
      const body = { cCallRef: cCall.cCallRef, contractRef: g.WORKSITE_C0_IDS.outputContractRef,
        evidenceClass: 'worksite_file_replace', implementationRef: cCall.implementationRef, inputDigest: hash(request),
        outputDigest: hash(output), request, authorization, receipt: physical.receipt, successorObservation: physical.successorObservation };
      const digest = hash(body);
      return f.append('c_call_evidenced', 'c_call', cCall.cCallRef, { ...body, evidenceRef: identity('evidence', digest), evidenceDigest: digest },
        { ...scope, causationEventRefs: [fibre.eventId] });
    });
    await capture(label + ' C0 evidence admitted', { physical, evidence,
      b1Current: current(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), controls(f)[0].value),
      b1Gate: nativeOwner.worksiteCommandSourcesInvalidatedAfter(f.prefix(), prior.rows.at(-1).admissionOrdinal, f.canonicalRoot, ['target.txt']) });
    assert.equal(current(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), controls(f)[0].value), prior.facts[1].indexed,
      'evidence alone preserves the pre-Result currentness coordinate');
    assert.equal(current(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), physical.successorObservation), false);
    const admitted = admittedResult(f, output, { callRef: cCall.cCallRef, contractRef: g.WORKSITE_C0_IDS.outputContractRef,
      evidenceRefs: [evidence.payload.evidenceRef], scope: { ...scope, causationEventRefs: [evidence.eventId] } });
    await capture(label + ' C0 Result admitted', { event: admitted.event, physical });
    assert.deepEqual(calculus.projectWorksiteTransitionForResult(admitted.event,
      f.rows().filter(e => e.admissionOrdinal < admitted.event.admissionOrdinal)), {
      before: request.predecessorObservation.observationRef, after: physical.successorObservation.observationRef,
      successorObservation: physical.successorObservation });
    assert.equal(current(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), request.predecessorObservation), false);
    const selected = [{ label: 'own successful after', value: physical.successorObservation, root: f.canonicalRoot, path: 'target.txt' }, ...controls(f)];
    const after = await views(f, label + ' after admitted C0', selected);
    const gates = controls(f).map(o => nativeOwner.worksiteCommandSourcesInvalidatedAfter(
      f.prefix(), prior.rows.at(-1).admissionOrdinal, o.root, [o.path]));
    assert.deepEqual(after.facts.map(row => row.indexed), [true, false, true, true]);
    assert.deepEqual(gates, [true, false, false]);
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(prior.prefix), prior.projection);
    const dependencies = calculus.eventCalculusDependencies(f.prefix(), admitted.event);
    const priorResultRows = f.rows().filter(row => row.admissionOrdinal < admitted.event.admissionOrdinal);
    assert.ok(dependencies.every(row => row.admissionOrdinal < admitted.event.admissionOrdinal));
    assert.ok(dependencies.some(row => row.kind === 'basis_admitted' && row.payload.rawInputValue?.predecessorObservation?.observationRef === controls(f)[0].value.observationRef));
    await capture(label + ' C0 physical withdrawal', { gates, dependencies: dependencies.map(row => row.eventId),
      resultEvent: admitted.event, after: after.facts, strictPriorRows: priorResultRows.length });
    return { physical, admitted, prior, after };
  };
  const nativeResult = async (f, label, value, report) => {
    const valid = value.kind === 'native_workspace_work_observation' ? isNativeWorkspaceWorkObservation(value) : isNativeWorkspaceWorkFailure(value);
    await capture(label + ' Product native value', { valid, value }); assert.equal(valid, true);
    const nativeResultAssessment = await componentNativeAssessment(f.task, f.set, report);
    const callRef = value.provenance.cCallRef, contractRef = value.kind === 'native_workspace_work_observation' ? ids.observationContractRef : ids.failureContractRef;
    const evidence = f.atCut(() => {
      const body = { cCallRef: callRef, contractRef, evidenceClass: 'probabilistic_transport', implementationRef: ids.implementationRef,
        inputDigest: hash(f.task), outputDigest: hash(value), transportDigest: value.provenance.transportDigest, nativeResultAssessment };
      const digest = hash(body);
      return f.append('c_call_evidenced', 'c_call', callRef, { ...body, evidenceRef: identity('evidence', digest), evidenceDigest: digest });
    });
    const admitted = admittedResult(f, value, { callRef, contractRef, evidenceRefs: [evidence.payload.evidenceRef],
      resultClass: value.kind === 'native_workspace_work_observation' ? 'success' : 'failure',
      judgment: value.kind === 'native_workspace_work_observation' ? 'advance' : 'stop',
      scope: { causationEventRefs: [evidence.eventId] } });
    await capture(label + ' actual evidence/Result', { evidence, admitted });
    return admitted.event;
  };
  const failC0AfterPublication = async () => {
    const label = 'actual C0 post-publication unavailable', f = await make([]), b2 = await addTargets(f, ['target.txt']);
    const request = b2.targets[0].request, env = b2.env;
    // Supplied lower binding/lock/install premises, not a performed Public bind.
    // The existing Product carrier predicate and checked ABG ingress stay real.
    const { kind: bindingKind, admissionEventRef, ...bindingBody } = env.workspaceBinding;
    const bindingCarrier = { kind: 'workspace_binding_candidate', ...bindingBody };
    const establishedLockPremise = { lockId: bindingCarrier.lockId, lockDigest: bindingCarrier.lockDigest };
    assert.equal(product.isWorkspaceBindingCandidateInResolvedLock(bindingCarrier, establishedLockPremise,
      undefined, env.workspaceAuthorityBasis), true);
    // ArtifactAdmissionBasis and envelope/payload correspondence mirror the
    // canonical producer in environment_admission.ts. The definition and
    // invocation remain supplied lower premises; storage append is not Public
    // workspace-bind execution or full artifact-truth qualification.
    const artifactBasis = deepFreeze({ ...publicOperationBasis(product, 'abg.operation.workspace.bind',
      bindingCarrier.bindingId, bindingCarrier.bindingDigest, 'invocation://u1/controlled-c0-binding'),
      eventTime: f.common.eventTime, correlationId: f.common.correlationId,
      predecessorPrefix: selectHeldEventStoreDurablePrefix(f.store) });
    const { operationId, memberKey, definitionDigest, invocationRef, invocationPayloadDigest, invocationDigest } = artifactBasis;
    assert.equal(isExactOperationInvocationCoordinate({ operationId, memberKey, definitionDigest,
      invocationRef, invocationPayloadDigest, invocationDigest }), true);
    const artifactCandidate = deepFreeze({ kind: 'public_operation_artifact_admitted', eventTime: artifactBasis.eventTime,
      aggregateType: 'workspace', aggregateId: artifactBasis.authorityScopeRef, parentAggregateId: null,
      causationEventRefs: artifactBasis.causationEventRefs, correlationId: artifactBasis.correlationId,
      workflowVersion: '5.0.0', scopeClass: 'workspace', basisId: artifactBasis.authorityScopeRef,
      payload: { operationId, memberKey, definitionDigest, authorityScopeRef: artifactBasis.authorityScopeRef,
        authorityScopeDigest: artifactBasis.authorityScopeDigest, invocationRef, invocationPayloadDigest, invocationDigest,
        ownerAdmittedDisposition: 'admitted', artifactRef: bindingCarrier.bindingId, artifactDigest: bindingCarrier.bindingDigest,
        artifact: bindingCarrier, workspaceAuthorityBasis: env.workspaceAuthorityBasis,
        causationEventRefs: artifactBasis.causationEventRefs, correlationId: artifactBasis.correlationId } });
    assert.equal(artifactCandidate.aggregateId, artifactCandidate.payload.authorityScopeRef);
    assert.equal(artifactCandidate.basisId, artifactCandidate.payload.authorityScopeRef);
    assert.equal(artifactCandidate.payload.authorityScopeRef, request.workspaceBindingIdentity);
    assert.equal(artifactCandidate.payload.authorityScopeDigest, request.workspaceBindingDigest);
    assert.equal(artifactCandidate.payload.artifactRef, request.workspaceBindingIdentity);
    assert.equal(artifactCandidate.payload.artifactDigest, request.workspaceBindingDigest);
    assert.equal(hash(artifactCandidate.payload.workspaceAuthorityBasis), hash(request.workspaceAuthorityBasis));
    assert.deepEqual(artifactCandidate.payload.causationEventRefs, artifactCandidate.causationEventRefs);
    assert.equal(artifactCandidate.payload.correlationId, artifactCandidate.correlationId);
    await capture(label + ' controlled artifact lower premise audit', { artifactBasis, artifactCandidate,
      premise: 'Canonical owner coordinate shape supplied through checked artifact storage; no performed Public operation or full artifact qualification.' });
    const bindingAppend = appendCheckedArtifactEvent(f.store, artifactBasis.predecessorPrefix, artifactCandidate);
    assert.ok(bindingAppend.event, JSON.stringify(bindingAppend));
    assert.equal(bindingAppend.event.payloadDigest, hash(artifactCandidate.payload));
    const parts = g.constructWorksiteC0PublicationParts({ productId: 'product://u1/controlled-c0',
      artifactDigest: hash('controlled-c0-artifact'), productContentDigest: hash('controlled-c0-content'),
      productManifestDigest: hash('controlled-c0-manifest'), packageName: '@abiogenesis/typescript-tenant',
      packageVersion: '5.0.0-dev.286' }, g.WORKSITE_C0_IDS.moduleRef);
    const graph = parts.graphFunctions[0], declaredBinding = parts.implementationBindings[0];
    const { kind, schemaVersion, disposition, leafResolutionCandidateRef, leafResolutionCandidateDigest, ...priorRow } = f.implementationSet.rows[0];
    const { kind: declaredKind, bindingRef, ...bindingFields } = declaredBinding;
    const rowBody = { ...priorRow, ...bindingFields, graphFunctionRef: graph.name, graphFunctionDigest: hash(graph),
      nodeRef: graph.template.startNodeRef, programLocusRef: graph.template.startNodeRef, implementationBindingRef: bindingRef };
    const rowDigest = hash(rowBody), row = { kind, schemaVersion, disposition,
      leafResolutionCandidateRef: identity('leaf-resolution-candidate', rowDigest), leafResolutionCandidateDigest: rowDigest, ...rowBody };
    const setDigest = hash({ rows: [row] }), set = { implementationSetRef: identity('implementation-set', setDigest),
      implementationSetDigest: setDigest, rows: [row] };
    const implementationEvent = f.atCut(() => f.append('implementation_admitted', 'workspace', bindingCarrier.bindingId,
      { implementationSetRef: set.implementationSetRef, implementationSetDigest: setDigest, implementationSet: set, interactionSetRef: 'interaction-set://u1/c0', interactionSetDigest: hash('c0-interactions') },
      { scopeClass: 'workspace' }));
    const implementationSet = { kind: 'admitted_implementation_set', schemaVersion: '5.0.0', disposition: 'admitted',
      ...set, admissionEventRef: implementationEvent.eventId };
    const c0Invocation = f.atCut(() => f.invocation(env, { graphFunctionRef: graph.name, graphFunctionDigest: hash(graph) }));
    const execution = f.atCut(() => f.basisFor(env, c0Invocation, request, { graphFunctionRef: graph.name,
      graphFunctionDigest: hash(graph), implementationSetRef: set.implementationSetRef, implementationSetDigest: setDigest }));
    const executionBasis = { kind: 'execution_basis', schemaVersion: '5.0.0', disposition: 'admitted', ...execution };
    const callBody = { basisId: execution.basisRef, graphCallId: 'graph-call://u1/c0-failure', frameId: 'frame://u1/c0-failure',
      vectorIndex: 0, stageRole: 'file-replace', taskOrdinal: null, attempt: 1, programLocusRef: row.programLocusRef, retryPath: [] };
    const cCallDigest = hash(callBody), callRef = `c-call:${cCallDigest}`;
    const scope = { basisId: execution.basisRef, graphFunctionRef: graph.name, graphCallId: callBody.graphCallId, frameId: callBody.frameId };
    const occurrence = f.atCut(() => {
      const opened = f.append('c_call_opened', 'c_call', callRef, { ...callBody, cCallRef: callRef, cCallDigest, callClass: 'leaf' }, scope);
      const fibre = f.append('c_call_fibre_selected', 'c_call', callRef, { cCallRef: callRef, callClass: 'leaf', armId: g.WORKSITE_C0_IDS.armId,
        regime: 'F_D', implementationRef: row.implementationRef, implementationBindingRef: row.implementationBindingRef,
        implementationRequirementKey: row.requirementKey, implementationSetRef: set.implementationSetRef },
        { ...scope, causationEventRefs: [opened.eventId] });
      return { opened, fibre };
    });
    const cCall = { ...f.cCall, ...callBody, cCallRef: callRef, cCallDigest, graphFunctionRef: graph.name,
      implementationSetRef: set.implementationSetRef, implementationRequirementKey: row.requirementKey,
      implementationRef: row.implementationRef, implementationBindingRef: row.implementationBindingRef,
      inputContractRef: row.inputContractRef, outputContractRef: row.outputContractRef,
      failureContractRef: row.failureContractRef, refusalContractRef: row.refusalContractRef,
      openedEventRef: occurrence.opened.eventId, fibreSelectedEventRef: occurrence.fibre.eventId, runId: f.common.runId };
    const authorization = product.constructWorksiteEffectAuthorization({ ...env, request, executionBasis, cCall, implementationSet });
    const input = { ...env, request, executionBasis, cCall, implementationSet, authorization };
    assert.equal(product.isWorksiteFileReplaceInput(input), true, JSON.stringify(authorization));
    const selected = [observation('b2 failed C0 predecessor', request), ...controls(f)];
    const before = await views(f, label + ' selected potential before physical effect', selected);
    assert.deepEqual(before.facts.map(row => row.indexed), [false, false, true, true]);
    assert.ok(projectWorksiteSelectedOccurrence(occurrence.fibre, worksiteSelectedOccurrenceDependencies(f.prefix(), occurrence.fibre)));
    const target = join(f.canonicalRoot, 'target.txt'), original = { rename: fs.rename, open: fs.open };
    const fault = { published: false, injected: 0, kind: 'controlled EIO on target open after actual rename' };
    fs.rename = async (source, destination) => { const result = await original.rename(source, destination);
      if (destination === target) fault.published = true; return result; };
    fs.open = async (path, ...args) => {
      if (fault.published && path === target) { fault.injected += 1; throw Object.assign(new Error('U1 selected post-publication EIO'), { code: 'EIO' }); }
      return original.open(path, ...args);
    };
    syncBuiltinESMExports();
    let physical;
    try { physical = await product.replaceWorksiteFile(input); }
    finally { Object.assign(fs, original); syncBuiltinESMExports(); }
    physicalEffects.push({ label, owner: 'replaceWorksiteFile', input, physical, fault });
    await capture(label + ' actual owner failure', { bindingCarrier, establishedLockPremise, bindingEvent: bindingAppend.event,
      implementationEvent, occurrence, input, physical, fault,
      lowerPremises: 'Supplied Public binding/install/definition/invocation/implementation selection and graph occurrence; actual Product carrier checks, checked artifact storage append, physical rename, injected substrate EIO and checked runtime evidence/Result append. No performed Public binding, full artifact qualification or installed workflow.' });
    assert.equal(fault.published, true); assert.equal(fault.injected, 1);
    assert.equal(product.isWorksitePostPublicationFailure(physical), true, JSON.stringify(physical));
    assert.equal(physical.code, 'filesystem_refused'); assert.equal(physical.substrateCode, 'EIO');
    assert.equal(physical.physicalOutcome.postPublicationObservation, null);
    assert.equal(physical.physicalOutcome.publication.committed, true);
    assert.equal(await fs.readFile(target, 'utf8'), 'candidate\n');
    assert.deepEqual(selectHeldEventStoreDurablePrefix(f.store), before.coordinate);
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(f.prefix()), before.projection);
    const authenticated = projectWorksiteFailureBasis(f.rows(), callRef, physical);
    assert.ok(authenticated, 'unchanged failure owner authenticates supplied lower premises and actual failure');
    assert.deepEqual(authenticated.authorization, authorization);
    const evidence = f.atCut(() => {
      const body = { cCallRef: callRef, contractRef: g.WORKSITE_C0_IDS.failureContractRef, evidenceClass: 'deterministic',
        implementationRef: row.implementationRef, inputDigest: hash(request), outputDigest: hash(physical) };
      const digest = hash(body);
      return f.append('c_call_evidenced', 'c_call', callRef, { ...body, evidenceRef: identity('evidence', digest), evidenceDigest: digest },
        { ...scope, causationEventRefs: [occurrence.fibre.eventId] });
    });
    const evidenced = await views(f, label + ' evidence only after selected potential', selected);
    assert.deepEqual(evidenced.facts.map(row => row.indexed), [false, false, true, true]);
    assert.equal(nativeOwner.worksiteCommandSourcesInvalidatedAfter(f.prefix(), before.rows.at(-1).admissionOrdinal,
      f.canonicalRoot, ['target.txt']), false, 'failure evidence alone is not an authenticated Result');
    const event = f.atCut(() => {
      const body = { cCallRef: callRef, resultClass: 'failure', contractRef: g.WORKSITE_C0_IDS.failureContractRef,
        valueKind: 'worksite_effect_refusal', value: physical, valueDigest: hash(physical), evidenceRefs: [evidence.payload.evidenceRef] };
      const digest = hash(body);
      return f.append('c_call_result_admitted', 'c_call', callRef, { ...body, resultRef: identity('result', digest), resultDigest: digest },
        { ...scope, causationEventRefs: [evidence.eventId] });
    });
    const prior = f.rows().filter(row => row.admissionOrdinal < event.admissionOrdinal);
    assert.deepEqual(calculus.projectWorksiteTransitionForResult(event, prior), {
      before: request.predecessorObservation.observationRef, after: null, successorObservation: null });
    assert.equal(calculus.projectWorksiteTransitionForResult({ ...event, payload: { ...event.payload, valueDigest: hash('wrong') } }, prior), null);
    assert.equal(calculus.projectWorksiteTransitionForResult(event, prior.filter(row => row.eventId !== evidence.eventId)), null);
    const after = await views(f, label + ' Result admitted', selected);
    assert.deepEqual(after.facts.map(row => row.indexed), [false, false, true, true]);
    assert.deepEqual(event.payload.value, physical);
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(before.prefix), before.projection);
    assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(evidenced.prefix), evidenced.projection);
    const dependencies = calculus.eventCalculusDependencies(f.prefix(), event);
    assert.ok(dependencies.every(row => row.admissionOrdinal < event.admissionOrdinal));
    for (const required of [bindingAppend.event, implementationEvent, evidence]) assert.ok(dependencies.some(row => row.eventId === required.eventId));
    assert.ok(dependencies.some(row => row.kind === 'basis_admitted' && row.payload.rawInputValue?.predecessorObservation?.observationRef === controls(f)[0].value.observationRef));
    const authDependencies = worksiteFailureResultDependencies(f.prefix(), event);
    assert.ok(authDependencies.every(row => row.admissionOrdinal < event.admissionOrdinal));
    assert.deepEqual(projectWorksiteFailureResultRequest(event, authDependencies), request);
    assert.ok(!authDependencies.some(row => row.kind === 'basis_admitted' && row.payload.rawInputValue?.predecessorObservation?.observationRef === controls(f)[0].value.observationRef),
      'gate authentication does not acquire unrelated observation targets');
    const gates = gateViews(f, before.rows.at(-1).admissionOrdinal, selected);
    for (const [index, row] of gates.entries()) for (const mode of ['indexed', 'full', 'coldLazy'])
      assert.equal(row[mode], index < 2, row.label + ' ' + mode);
    assert.equal(nativeOwner.worksiteCommandSourcesInvalidatedAfter(f.prefix(), before.rows.at(-1).admissionOrdinal,
      f.canonicalRoot, [], ['.']), true, 'existing read-root interpretation includes the exact target');
    assert.equal(nativeOwner.worksiteCommandSourcesInvalidatedAfter(f.prefix(), before.rows.at(-1).admissionOrdinal,
      f.canonicalRoot, [], ['keep.txt']), false);
    const negatives = [];
    for (const [name, mutate] of [
      ['altered failure value', rows => { rows.at(-1).payload.value.physicalOutcome.authorization.authorizationDigest = hash('foreign-authorization'); }],
      ['altered Result digest', rows => { rows.at(-1).payload.resultDigest = hash('foreign-result'); }],
      ['altered evidence digest', rows => { rows.find(row => row.eventId === evidence.eventId).payload.evidenceDigest = hash('foreign-evidence'); }],
      ['missing Result cause', rows => { rows.at(-1).causationEventRefs = []; }],
      ['wrong binding support', rows => { rows.find(row => row.eventId === bindingAppend.event.eventId).payload.artifactDigest = hash('foreign-binding'); }],
    ]) {
      const rows = clone(f.rows()); mutate(rows);
      for (const row of rows) row.payloadDigest = hash(row.payload);
      const negativePrefix = prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(rows));
      const invalidated = nativeOwner.worksiteCommandSourcesInvalidatedAfter(negativePrefix,
        before.rows.at(-1).admissionOrdinal, f.canonicalRoot, ['target.txt']);
      assert.equal(invalidated, false, name);
      const selectedFibre = rows.find(row => row.eventId === occurrence.fibre.eventId);
      const potential = projectWorksiteSelectedOccurrence(selectedFibre, rows.filter(row => row.admissionOrdinal < selectedFibre.admissionOrdinal)) !== null;
      assert.equal(nativeOwner.worksiteCommandSourcesInvalidatedAfter(negativePrefix, selectedFibre.admissionOrdinal - 1,
        f.canonicalRoot, ['target.txt']), potential, 'bad later Result does not erase a valid earlier potential cause');
      negatives.push({ name, invalidated, potential, premise: 'controlled corrupted copy; not admitted history' });
    }
    await capture(label + ' authenticated transition and dependency closure', { event, evidence, authenticated,
      dependencies: dependencies.map(row => row.eventId), authDependencies: authDependencies.map(row => row.eventId),
      currentness: after.facts, gates, negatives, prefixRows: f.rows().length,
      authenticationExtent: 'aggregate:c_call, exact basis/invocation/parent, binding artifact and implementation; no full fold or target population' });
  };
  try {
    for (const callable of [isCapabilityGrantValue, constructNativeWorkspaceWorkTask, isNativeWorkspaceWorkTask,
      isNativeWorkspaceWorkObservation, isNativeWorkspaceWorkFailure, nativeWorkspaceChangedPaths,
      nativeWorkspaceScopeViolations, componentNativeAssessment, projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix])
      assert.equal(typeof callable, 'function');
    {
      const f = await make(['target.txt']), b2 = await addTargets(f, ['target.txt']);
      const selected = [observation('b2 affected predecessor', b2.targets[0].request), ...controls(f)];
      const before = await views(f, 'cross-binding predecessor before', selected);
      assert.ok(before.facts.every(row => row.indexed));
      await causeAfter(f, 'cross-binding predecessor after', selected, [false, false, true, true], before);
    }
    for (const roots of [['target.txt'], []]) {
      const label = roots.length ? 'cross-binding C0 successor' : 'empty-write C0 successor';
      const f = await make(roots), b2 = await addTargets(f, ['target.txt']), committed = await commitC0(f, b2, label.replaceAll(' ', '-'));
      const selected = [{ label: 'b2 admitted successor', value: committed.physical.successorObservation, root: f.canonicalRoot, path: 'target.txt' }, ...controls(f)];
      const before = await views(f, label + ' before', selected);
      assert.deepEqual(before.facts.map(row => row.indexed), [true, false, true, true]);
      await causeAfter(f, label + ' after', selected, [roots.length === 0, false, true, true], before,
        [roots.length !== 0, roots.length !== 0, false, false]);
      assert.deepEqual(f.rows().find(row => row.eventId === committed.admitted.event.eventId), committed.admitted.event);
      assert.equal(await fs.readFile(join(f.canonicalRoot, 'target.txt'), 'utf8'), 'candidate\n', 'retirement does not roll back physical bytes');
    }
    for (const mode of ['known-off-scope', 'known-empty', 'after-unavailable']) {
      const f = await make(mode === 'known-off-scope' ? ['target.txt'] : ['target.txt', 'keep.txt']);
      const b2 = await addTargets(f, ['target.txt', 'keep.txt']);
      const selected = [...b2.targets.map(({ request }) => observation('b2 ' + request.subject.relativePath, request)), ...controls(f)];
      const before = await views(f, mode + ' before', selected); assert.ok(before.facts.every(row => row.indexed));
      if (mode === 'known-off-scope') await fs.writeFile(join(f.canonicalRoot, 'keep.txt'), 'actual controlled off-scope change\n');
      if (mode === 'after-unavailable') await fs.writeFile(join(f.canonicalRoot, 'target.txt'), Buffer.alloc(f.task.context.maxBytes + 1, 120));
      const after = await product.observeWorksiteContext({ workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding,
        readRoots: f.task.context.readRoots, maxFiles: f.task.context.maxFiles, maxBytes: f.task.context.maxBytes });
      physicalEffects.push({ label: mode, owner: 'controlled fixture file preparation then actual Product observeWorksiteContext', after }); await retention();
      const report = { summary: 'Controlled component native Result scope', gaps: [] };
      const provenance = { cCallRef: f.process.payload.cCallRef, executionAuthorityRef: 'authority://u1/' + mode,
        executionAuthorityDigest: hash(mode), actorInvocationRef: f.actorRef, transportBindingRef: f.binding.aggregateId,
        transportBindingDigest: f.binding.payload.transportBindingDigest, promptDigest: hash(['prompt', mode]), transportDigest: hash(['transport', mode]) };
      let value, expected;
      if (mode === 'known-empty') {
        assert.equal(p.isWorksiteContextObservation(after), true);
        value = constructNativeWorkspaceWorkObservation(f.task, after, report, provenance); expected = [true, true, true, true, true];
        assert.deepEqual(value.changedPaths, []);
      } else {
        const unavailable = mode === 'after-unavailable';
        if (unavailable) assert.equal(after.kind, 'worksite_effect_refusal');
        else { assert.equal(p.isWorksiteContextObservation(after), true); assert.deepEqual(nativeWorkspaceScopeViolations(f.task, after), ['keep.txt']); }
        value = { kind: 'native_workspace_work_failure', schemaVersion: '5.0.0',
          failureClass: unavailable ? 'post_work_observation_failed' : 'write_scope_violation', diagnosticRef: 'diagnostic://u1/' + mode,
          task: f.task, before: f.task.context, after: unavailable ? null : after,
          changedPaths: unavailable ? null : nativeWorkspaceChangedPaths(f.task.context, after),
          observationFailure: unavailable ? after : null, report, provenance };
        expected = unavailable ? [false, false, false, false, true] : [true, false, true, false, true];
        if (!unavailable) assert.deepEqual(value.changedPaths, ['keep.txt']);
      }
      const event = await nativeResult(f, mode, value, report), projected = await views(f, mode + ' after', selected);
      const retired = calculus.projectNativeWorkRetiredObservations(event, f.rows().filter(row => row.admissionOrdinal < event.admissionOrdinal));
      const gates = selected.map(o => nativeOwner.worksiteCommandSourcesInvalidatedAfter(f.prefix(), before.rows.at(-1).admissionOrdinal, o.root, [o.path]));
      await capture(mode + ' Result scope', { event, retired, gates, expected });
      for (let i = 0; i < selected.length; i++) { assert.equal(projected.facts[i].indexed, expected[i], selected[i].label); assert.equal(gates[i], !expected[i]); }
      assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(before.prefix), before.projection);
    }
    {
      // W and R are distinct. A known native Result impacts observed changes ∪ (W\R): EC and the
      // currentness gate retire unobserved W\R facts, present and absent, and keep observed-unchanged R facts.
      const label = 'known-outside-read', writeRoots = ['target.txt', 'nested'];
      const f = await make(writeRoots, { taskFactory: async env => constructNativeWorkspaceWorkTask({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
        workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant,
        context: await product.observeWorksiteContext({ ...env, readRoots: ['target.txt', 'keep.txt'], maxFiles: 30, maxBytes: 10000 }),
        outcome: 'Bounded test work with disposable tooling', instructions: ['Use only the declared scope.'], readFirst: ['target.txt'], writeRoots, checks: [] }) });
      assert.deepEqual([f.task.context.readRoots, f.task.writeRoots], [['target.txt', 'keep.txt'], writeRoots]);
      const b2 = await addTargets(f, ['target.txt', 'keep.txt', 'nested/file.txt', 'nested/absent.txt']);
      const selected = [...b2.targets.map(({ request }) => observation('b2 ' + request.subject.relativePath, request)), ...controls(f)];
      const before = await views(f, label + ' before', selected); assert.ok(before.facts.every(row => row.indexed));
      const after = await product.observeWorksiteContext({ workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding,
        readRoots: f.task.context.readRoots, maxFiles: f.task.context.maxFiles, maxBytes: f.task.context.maxBytes });
      physicalEffects.push({ label, owner: 'actual Product observeWorksiteContext over R only', after }); await retention();
      const report = { summary: 'Controlled component native Result outside R', gaps: [] };
      const provenance = { cCallRef: f.process.payload.cCallRef, executionAuthorityRef: 'authority://u1/' + label,
        executionAuthorityDigest: hash(label), actorInvocationRef: f.actorRef, transportBindingRef: f.binding.aggregateId,
        transportBindingDigest: f.binding.payload.transportBindingDigest, promptDigest: hash(['prompt', label]), transportDigest: hash(['transport', label]) };
      const value = constructNativeWorkspaceWorkObservation(f.task, after, report, provenance);
      assert.deepEqual(value.changedPaths, [], 'R is observed unchanged; W\\R is never reported as changed');
      const event = await nativeResult(f, label, value, report), projected = await views(f, label + ' after', selected);
      const afterOrdinal = before.rows.at(-1).admissionOrdinal;
      const gates = selected.map(o => nativeOwner.worksiteCommandSourcesInvalidatedAfter(f.prefix(), afterOrdinal, o.root, [o.path]));
      // b2 target (R∩W), b2 keep (R\W), b2 nested present and absent (W\R), b1 target, same-root sibling, other root.
      const expected = [true, true, false, false, true, true, true];
      await capture(label + ' Result scope', { event, gates, expected,
        retired: calculus.projectNativeWorkRetiredObservations(event, f.rows().filter(row => row.admissionOrdinal < event.admissionOrdinal)) });
      for (let i = 0; i < selected.length; i++) {
        assert.equal(projected.facts[i].indexed, expected[i], selected[i].label);
        assert.equal(gates[i], !expected[i], selected[i].label + ' native gate');
      }
      assert.deepEqual(['nested', 'keep.txt', '.'].map(root => nativeOwner.worksiteCommandSourcesInvalidatedAfter(f.prefix(), afterOrdinal, f.canonicalRoot, [], [root])),
        [true, false, true], 'selected read-root subtrees overlap W\\R exactly');
      assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(before.prefix), before.projection);
    }
    for (const crossed of [false, true]) {
      const label = crossed ? 'E1 re-signed G2 task versus G1 invocation' : 'E1 matched G1 control';
      const f = await make(['target.txt'], { taskFactory: async env => {
        const { kind, schemaVersion, grantRef, grantDigest, ...body } = env.capabilityGrant;
        const next = { ...body, policyRef: 'policy://u1/different-valid-grant', policyDigest: hash('different-valid-grant') };
        const digest = hash(next), grant = crossed ? { kind: 'capability_grant', schemaVersion: '5.0.0',
          grantRef: identity('capability-grant', digest), grantDigest: digest, ...next } : env.capabilityGrant;
        assert.equal(isCapabilityGrantValue(grant), true);
        const context = await product.observeWorksiteContext({ ...env, readRoots: ['.'], maxFiles: 30, maxBytes: 10000 });
        return constructNativeWorkspaceWorkTask({ workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding,
          capabilityGrant: grant, context, outcome: 'Grant-membership discriminator', instructions: ['Use only target.txt.'], readFirst: ['target.txt'], writeRoots: ['target.txt'], checks: [] });
      } });
      const selected = controls(f), before = await views(f, label + ' before', selected);
      const basis = projectExactExecutionBasisAtPrefix(before.prefix, f.basis.basisRef), invocation = projectExactInvocationAdmissionAtPrefix(before.prefix, f.inv.invocationAdmissionRef);
      const event = f.cause(), dependencies = calculus.eventCalculusDependencies(f.prefix(), event);
      const task = projectNativeWorkUnknownEffectTask(event, dependencies, before.prefix), after = await views(f, label + ' after', selected);
      const gates = selected.map(o => nativeOwner.worksiteCommandSourcesInvalidatedAfter(f.prefix(), before.rows.at(-1).admissionOrdinal, o.root, [o.path]));
      const { transportBindingRef, transportBindingDigest, ...transportBody } = f.binding.payload;
      await capture(label + ' exact joins', { basis, invocation, event, task, gates, taskValue: f.task,
        actualInvocationGrant: f.capabilityGrant, transportBody, transportBindingDigest });
      assert.ok(basis); assert.ok(invocation); assert.equal(isNativeWorkspaceWorkTask(f.task), true);
      assert.equal(isCapabilityGrantValue(f.task.capabilityGrant), true); assert.equal(isCapabilityGrantValue(f.capabilityGrant), true);
      assert.deepEqual(basis.rawInputValue, f.task); assert.equal(basis.rawInputDigest, hash(f.task));
      assert.equal(hash(transportBody), transportBindingDigest); assert.equal(transportBindingRef, f.binding.aggregateId);
      assert.equal(transportBody.inputDigest, basis.rawInputDigest); assert.equal(f.actor.payload.inputDigest, basis.rawInputDigest);
      assert.equal(invocation.capabilityGrants.some(grant => hash(grant) === hash(f.task.capabilityGrant)), !crossed);
      if (crossed) assert.equal(task, null); else assert.deepEqual(task, f.task);
      assert.deepEqual(after.facts.map(row => row.indexed), [crossed, true, true]); assert.deepEqual(gates, [!crossed, false, false]);
    }
    {
      const label = 'next C0 successor', f = await make([]), b2 = await addTargets(f, ['target.txt']);
      const first = await commitC0(f, b2, 'next-successor-first');
      const oldAfter = first.physical.successorObservation;
      const nextRequest = product.constructWorksiteFileReplaceRequest({ ...b2.env, ...b2.targets[0].request,
        predecessorObservation: oldAfter, replacementBytes: Buffer.from('next candidate\n') });
      assert.equal(product.isWorksiteFileReplaceRequest(nextRequest), true);
      const next = await commitC0(f, { ...b2, targets: [{ request: nextRequest }] }, 'next-successor-second', 'next candidate\n');
      assert.equal(current(next.after.projection, oldAfter), false);
      assert.equal(current(next.after.projection, next.physical.successorObservation), true);
      assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(first.after.prefix), first.after.projection);
      assert.deepEqual(f.rows().find(row => row.eventId === first.admitted.event.eventId), first.admitted.event);
      await capture(label + ' conserved history', { oldAfter, newAfter: next.physical.successorObservation,
        oldCurrent: false, newCurrent: true, firstResult: first.admitted.event, secondResult: next.admitted.event });
    }
    await failC0AfterPublication();
    await capture('selected proof complete', { cases: ['cross-binding predecessor', 'actual C0 successor', 'empty-write C0 successor',
      'known-off-scope', 'known-empty', 'after-unavailable', 'known-outside-read', 'E1 matched G1', 'E1 re-signed G2', 'next C0 successor',
      'actual C0 post-publication unavailable'], result: 'satisfied under declared premises' });
    t.diagnostic('Eleven selected physical-scope/C0 cases completed; no native/command actor, no installed claim.');
  } catch (error) {
    await capture('first unexpected failure', { error: { name: error.name, message: error.message, stack: error.stack }, dependentCasesStopped: true }); throw error;
  } finally {
    for (const f of localFixtures) f.store.closeDurableLog();
    // Fixture cleanup callbacks intentionally remain uncalled, including success.
  }
});

// TD-08: worksite currentness at basis admission. The equivalence reference is
// worksiteBasisMayEstablish at head 7e2425376 (code/src/abg/calculus/axioms.ts:533-563),
// transcribed from its build, with its two ordinals returned beside the boolean.
// The owners it calls are unchanged by TD-08 and are read from the built module.
let td08Module;
const td08Axioms = () => td08Module ??= builtModuleExports('abg/calculus/axioms', ['worksiteBasisMayEstablish',
  'worksiteBasisCauseOrdinals', 'worksiteCauseSupport', 'worksiteTransitionForResult', 'nativeWorkPhysicalScope',
  'isRecord', 'isWorksiteFileReplaceRequest', 'projectWorksiteSelectedOccurrence', 'validatedRuntimeEventPrefixBeforeEvent']);
function headWorksiteBasisCauseOrdinals(m, event, priorEvents, ownedPrefix) {
  if (!m.isRecord(event.payload) || !m.isWorksiteFileReplaceRequest(event.payload.rawInputValue)) return null;
  const request = event.payload.rawInputValue;
  let lastCause = 0, lastEstablishment = 0;
  for (const cause of priorEvents) {
    if (cause.kind !== 'c_call_result_admitted' && cause.kind !== 'c_call_fibre_selected' &&
      cause.kind !== 'actor_invocation_failed' && cause.kind !== 'actor_process_termination_unconfirmed') continue;
    const before = priorEvents.filter(row => row.admissionOrdinal < cause.admissionOrdinal);
    const transition = cause.kind === 'c_call_result_admitted' ? m.worksiteTransitionForResult(cause, before) : null;
    const selected = cause.kind === 'c_call_fibre_selected' ? m.projectWorksiteSelectedOccurrence(cause, before) : null;
    const causeRequest = transition?.request ?? selected?.request;
    if (causeRequest !== undefined && causeRequest.workspaceAuthorityBasis.canonicalRoot === request.workspaceAuthorityBasis.canonicalRoot &&
      causeRequest.subject.relativePath === request.subject.relativePath) {
      lastCause = Math.max(lastCause, cause.admissionOrdinal);
      if (transition?.after === request.predecessorObservation.observationRef && transition.successorObservation !== null)
        lastEstablishment = Math.max(lastEstablishment, cause.admissionOrdinal);
    }
    const native = m.nativeWorkPhysicalScope(cause, before, ownedPrefix === undefined ? undefined :
      m.validatedRuntimeEventPrefixBeforeEvent(ownedPrefix, cause.eventId));
    if (native?.canonicalRoot === request.workspaceAuthorityBasis.canonicalRoot && native.affectsPath(request.subject.relativePath))
      lastCause = Math.max(lastCause, cause.admissionOrdinal);
  }
  return { lastCause, lastEstablishment };
}
const TD08_CAUSES = ['c_call_result_admitted', 'c_call_fibre_selected', 'actor_invocation_failed', 'actor_process_termination_unconfirmed'];
const td08Value = ordinals => ordinals !== null && (ordinals.lastCause === 0 || ordinals.lastEstablishment >= ordinals.lastCause);
const td08Outcome = run => { try { return run(); } catch (error) { return { throws: error.message }; } };
const td08Head = (m, event, prior, owned) => td08Outcome(() => {
  const ordinals = headWorksiteBasisCauseOrdinals(m, event, prior, owned); return { ordinals, value: td08Value(ordinals) };
});
const td08New = (m, event, prior, owned) => td08Outcome(() => ({ ordinals: m.worksiteBasisCauseOrdinals(event, prior, owned),
  value: m.worksiteBasisMayEstablish(event, prior, owned) }));
const td08Shuffle = rows => {
  const out = [...rows]; let seed = 0x2468ace;
  for (let i = out.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) % 2147483648; const j = seed % (i + 1); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

test('TD-08 (a): basis-admission worksite currentness equals the head reference on every history and dependency list', async t => {
  const m = await td08Axioms(), seen = { compared: 0, values: new Set(), throws: new Set(), located: 0 };
  for (const preflight of [true, false]) {
    const h = await createWorksiteCauseHistory(t, { preflight });
    const subjects = [[h.first, 'target.txt'], [h.first, 'keep.txt'], [h.other, 'target.txt']], checks = [];
    const checkpoint = async label => {
      for (const [state, path] of subjects) checks.push({ label, subject: state.label + '/' + path, ...(await h.basis(state, path)) });
    };
    await checkpoint('initial');
    await h.nativeChange('target.txt', preflight ? 'preflight' : 'store'); // before any change outside the native write roots
    await checkpoint('native change');
    const established = await h.c0(h.first, 'target.txt');
    await checkpoint('established');
    checks.push({ label: 'stale predecessor', subject: 'first/target.txt',
      ...(await h.basis(h.first, 'target.txt', established.request.predecessorObservation)) });
    await h.c0(h.other, 'target.txt'); await h.c0(h.first, 'keep.txt'); await h.c0(h.first, 'keep.txt', { runId: 'run://td08/other' });
    await checkpoint('other root, other path, other Run');
    await h.c0(h.first, 'target.txt', { mode: 'failure' });
    await checkpoint('withdrawn');
    await h.c0(h.first, 'target.txt', { runId: 'run://td08/other' });
    await checkpoint('re-established');
    await h.c0(h.first, 'target.txt', { mode: 'selected' });
    await checkpoint('selected');
    for (const kind of ['actor_process_termination_unconfirmed', 'actor_invocation_failed']) {
      await h.c0(h.first, 'target.txt');
      await checkpoint(kind + ' re-established');
      for (const variant of ['other-run', 'no-task', 'task']) { h.unknown(kind, variant); await checkpoint(kind + ' ' + variant); }
    }
    const events = deepFreeze(clone(h.rows())), byId = new Map(events.map(row => [row.eventId, row]));
    const full = prefixes.selectValidatedRuntimeEventPrefix(events), located = preflight ? null : h.f.prefix();
    const firstCause = events.find(row => TD08_CAUSES.includes(row.kind));
    const nonWorksite = events.find(row => row.kind === 'basis_admitted' && row.payload.rawInputValue?.kind !== 'worksite_file_replace_request');
    checks.push({ label: 'not a worksite request', subject: 'none', event: nonWorksite });
    const ordered = new Map();
    for (const check of checks) {
      const event = byId.get(check.event.eventId), prior = Object.freeze(events.filter(row => row.admissionOrdinal < event.admissionOrdinal));
      const cut = prefixes.validatedRuntimeEventPrefixBeforeEvent(full, event.eventId);
      const variants = [['ordered', prior], ['shuffled', td08Shuffle(prior)], ['reversed', [...prior].reverse()],
        ['every row twice', prior.flatMap(row => [row, row])], ['owned historical cut', prior, cut],
        ['owned cold prefix', prior, prefixes.selectValidatedRuntimeEventPrefix(prior)], ['shuffled, owned', td08Shuffle(prior), cut],
        ['no dependencies, owned', [], cut], ['no dependencies', []],
        ['causes absent from owned', prior, prefixes.validatedRuntimeEventPrefixBeforeEvent(full, firstCause.eventId)]];
      if (located !== null) {
        const before = prefixes.validatedRuntimeEventPrefixBeforeEvent(located, event.eventId);
        variants.push(['located dependencies', calculus.eventCalculusDependencies(located, check.event), before],
          ['located, causes absent', calculus.eventCalculusDependencies(located, check.event),
            prefixes.validatedRuntimeEventPrefixBeforeEvent(located, firstCause.eventId)]);
        seen.located += 1;
      }
      for (const [name, list, owned] of variants) {
        const reference = td08Head(m, event, list, owned), actual = td08New(m, event, list, owned);
        assert.deepEqual(actual, reference, `${preflight ? 'preflight' : 'store'} ${check.label} ${check.subject}: ${name}`);
        seen.compared += 1;
        if (reference.throws !== undefined) seen.throws.add(name + ': ' + reference.throws); else seen.values.add(reference.value);
      }
      ordered.set(check.label + ' ' + check.subject, td08Head(m, event, prior).value);
      // Rollback: after the full fold, the fold of a shorter cut through this basis equals its cold fold.
      calculus.deriveRuntimeEventCalculusProjection(full);
      const next = events.find(row => row.admissionOrdinal === event.admissionOrdinal + 1);
      const warm = next === undefined ? full : prefixes.validatedRuntimeEventPrefixBeforeEvent(full, next.eventId);
      assert.deepEqual(calculus.deriveRuntimeEventCalculusProjection(warm), calculus.deriveRuntimeEventCalculusProjection(
        prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(clone(events.filter(row => row.admissionOrdinal <= event.admissionOrdinal))))),
        `${check.label} ${check.subject}: rollback`);
    }
    // The cases decide what they name: the subject alone is withdrawn and re-established.
    const at = (label, subject = 'first/target.txt') => ordered.get(label + ' ' + subject);
    assert.equal(at('native change'), false);
    assert.equal(at('established'), true);
    assert.equal(at('stale predecessor'), false);
    assert.equal(at('withdrawn'), false);
    assert.equal(at('withdrawn', 'first/keep.txt'), at('other root, other path, other Run', 'first/keep.txt'));
    assert.equal(at('withdrawn', 'second/target.txt'), at('other root, other path, other Run', 'second/target.txt'));
    assert.equal(at('re-established'), true);
    assert.equal(at('selected'), false);
    for (const kind of ['actor_process_termination_unconfirmed', 'actor_invocation_failed']) {
      assert.equal(at(kind + ' re-established'), true, kind);
      assert.equal(at(kind + ' other-run'), true, kind + ' other Run');
      assert.equal(at(kind + ' no-task'), true, kind + ' without a native task');
      assert.equal(at(kind + ' task'), false, kind + ' with the native task');
      assert.equal(at(kind + ' task', 'second/target.txt'), at(kind + ' re-established', 'second/target.txt'), kind + ' other root');
    }
    assert.equal(at('not a worksite request', 'none'), false);
  }
  assert.deepEqual([...seen.values].sort(), [false, true]);
  assert.ok([...seen.throws].some(entry => entry.startsWith('causes absent from owned: historical event-prefix boundary')), [...seen.throws].join('\n'));
  assert.ok(seen.located > 0);
  t.diagnostic(`TD-08 equivalence: ${seen.compared} comparisons; refusals ${[...seen.throws].join(' | ')}`);
});

// TD-08 (b): visits of the dependency list by one basis admission's currentness
// check: N C0 occurrences on the subject, or N on the same path under another
// root followed by one on the subject. A visit is one run of property reads on
// one row (eventVisitCounter). The head reference reproduces the visits the head
// build gave in this harness at 7e2425376, before the change. The owned prefix
// index is warmed first: in the fold it is shared across cuts of one source.
const TD08_HEAD_BUILD_VISITS = { 'subject 1': 588, 'unrelated 1': 1215, 'subject 32': 73996, 'unrelated 32': 78219,
  'subject 256': 3917388, 'unrelated 256': 3947595 };
test('TD-08 (b): visits grow with the subject\'s causes; joins are independent of unrelated causes', async t => {
  const m = await td08Axioms(), rows = [];
  for (const n of [1, 32, 256]) for (const scenario of ['subject', 'unrelated']) {
    const h = await createWorksiteCauseHistory(t);
    if (scenario === 'unrelated') for (let i = 0; i < n; i++) await h.c0(h.other, 'target.txt');
    for (let i = 0; i < (scenario === 'subject' ? n : 1); i++) await h.c0(h.first, 'target.txt');
    const basis = await h.basis(h.first, 'target.txt');
    const prior = h.rows().filter(row => row.admissionOrdinal < basis.event.admissionOrdinal);
    const counter = eventVisitCounter(), counted = Object.freeze(prior.map(counter.wrap));
    const owned = prefixes.selectValidatedRuntimeEventPrefix(counted);
    prefixes.runtimeEventAtPrefix(owned, counted[0].eventId);
    const { canonicalRoot } = basis.request.workspaceAuthorityBasis, { relativePath } = basis.request.subject;
    const head = counter.measure(() => headWorksiteBasisCauseOrdinals(m, basis.event, counted));
    const headOwned = counter.measure(() => headWorksiteBasisCauseOrdinals(m, basis.event, counted, owned));
    const after = counter.measure(() => m.worksiteBasisCauseOrdinals(basis.event, counted));
    const afterOwned = counter.measure(() => m.worksiteBasisCauseOrdinals(basis.event, counted, owned));
    const acquisition = counter.measure(() => m.worksiteCauseSupport(counted, canonicalRoot, relativePath)).visits;
    const causes = prior.filter(row => TD08_CAUSES.includes(row.kind)).length, key = scenario + ' ' + n;
    assert.deepEqual(after.value, head.value, key); assert.deepEqual(afterOwned.value, headOwned.value, key + ' owned');
    assert.ok(after.value.lastCause > 0 && after.value.lastEstablishment === after.value.lastCause, key + ': the subject is established');
    assert.equal(head.visits, TD08_HEAD_BUILD_VISITS[key], key + ': the reference is head');
    assert.equal(acquisition, prior.length, key + ': the support pass visits each row once');
    const row = { n, scenario, prior: prior.length, causes, head: head.visits, headOwned: headOwned.visits, after: after.visits,
      afterOwned: afterOwned.visits, acquisition, joins: after.visits - acquisition, boundary: afterOwned.visits - after.visits };
    rows.push(row); t.diagnostic(JSON.stringify(row));
  }
  const of = (scenario, n) => rows.find(row => row.scenario === scenario && row.n === n);
  assert.equal(of('unrelated', 32).joins, of('unrelated', 1).joins);
  assert.equal(of('unrelated', 256).joins, of('unrelated', 1).joins);
  assert.ok(of('subject', 1).joins < of('subject', 32).joins && of('subject', 32).joins < of('subject', 256).joins);
  // With an owned prefix each cause's boundary is one `id:` lookup: it reads the
  // cause and the prefix's last row, one run fewer where the last row is a cause.
  for (const row of rows) assert.equal(row.boundary, 2 * row.causes - 1, JSON.stringify(row));
});

// TD-09: the C2 prefix correspondence. The reference is the comparison of
// `exactC2SourceEnvironment` at c971aef24 (execution_basis.ts:799, :807-810),
// transcribed: the durable cut's rows and the materialized view, each admitted
// to JsonValue, compared canonically; a throw is a refusal. The reach lanes'
// pairs are compared with the same transcription by the C-13 instrumentation.
import { tmpdir } from 'node:os';
import * as td09Events from '../../build/code/src/abg/event_store.js';
import { admitJson as td09AdmitJson } from '../../build/code/src/shared/admit/index.js';
import { canonicalEquals as td09CanonicalEquals } from '../../build/code/src/shared/value/index.js';
const td09Reference = (cut, view) => {
  try {
    const durableEvents = td09AdmitJson(td09Events.readRuntimeEventsAtDurablePrefix(cut));
    const viewEvents = td09AdmitJson(JSON.parse(JSON.stringify(prefixes.runtimeEventBodiesAtPrefix(view).materialize())));
    return durableEvents.kind === 'ok' && viewEvents.kind === 'ok' && td09CanonicalEquals(durableEvents.value, viewEvents.value);
  } catch { return false; }
};
const td09Candidate = (index, variant, causationEventRefs) => {
  const invocationRef = `invocation://t287/td09/${index}`, correlationId = `correlation://t287/td09/${index}`;
  return { kind: 'public_operation_admitted', eventTime: '2026-10-25T00:00:00.000Z', aggregateType: 'workspace', aggregateId: invocationRef,
    parentAggregateId: null, causationEventRefs, correlationId, workflowVersion: '5.0.0', scopeClass: 'workspace', basisId: 'basis://abiogenesis/t287/td09',
    payload: { invocationDigest: hash({ invocationRef, correlationId }), invocationRef, operationId: 'abg.operation.project.read', variant } };
};
const td09RowReads = () => {
  let counting = false, reads = 0;
  const count = () => { if (counting) reads++; };
  const handler = { get: (target, key, receiver) => { count(); return Reflect.get(target, key, receiver); },
    getOwnPropertyDescriptor: (target, key) => { count(); return Reflect.getOwnPropertyDescriptor(target, key); },
    ownKeys: target => { count(); return Reflect.ownKeys(target); }, has: (target, key) => { count(); return Reflect.has(target, key); } };
  return { wrap: row => new Proxy(row, handler),
    measure: run => { reads = 0; counting = true; try { return { value: run(), reads }; } finally { counting = false; } } };
};
// A held store admitting one candidate per index; `variants` changes the body at an index.
async function td09History(t, label, count, variants = {}) {
  const scratch = await fs.mkdtemp(join(tmpdir(), `abi5-td09-${label}-`)), path = join(scratch, 'events.jsonl');
  const acquired = td09Events.createNewEmptyAppendSink({ kind: 'new_empty_append_sink_request', schemaVersion: '5.0.0', eventLogPath: path });
  assert.ok('store' in acquired, `${label}: ${acquired.code}`);
  let open = true, current = acquired.prefix;
  const close = () => { if (open) { open = false; acquired.store.closeDurableLog(); } };
  t.after(async () => { try { close(); } finally { await fs.rm(scratch, { force: true, recursive: true }); } });
  const ids = [], append = () => {
    const index = ids.length, admitted = td09Events.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store, current,
      () => td09Events.admitRuntimeEvent(acquired.store, td09Candidate(index, variants[index] ?? 'status', ids.slice(-1))));
    ids.push(admitted.value.eventId); current = admitted.successorPrefix; return current;
  };
  for (let i = 0; i < count; i++) append();
  const located = through => prefixes.validatedRuntimeEventPrefixThroughEvent(prefixes.selectRuntimeEventPrefixFromStore(acquired.store), ids[through]);
  return { store: acquired.store, path, ids, append, close, current: () => current, located };
}

test('TD-09 (a): the C2 prefix correspondence equals the base comparison at every cut and view pair; a repeated read compares nothing', async t => {
  const a = await td09History(t, 'a', 4), changed = await td09History(t, 'changed', 3, { 2: 'other' }), same = await td09History(t, 'same', 3);
  const current1 = a.current(), rows = td09Events.readRuntimeEventsAtDurablePrefix(current1), cut1 = td09Events.durableRuntimeEventPrefixThroughEvent(current1, a.ids[2]);
  const array = prefixes.validatedRuntimeEventPrefixThroughEvent(prefixes.selectValidatedRuntimeEventPrefix(rows), a.ids[2]);
  const cold = () => prefixes.selectValidatedRuntimeEventPrefix(deepFreeze(clone(rows.slice(0, 3))));
  const checked = [];
  const pair = (label, cut, view, expected) => {
    const reference = td09Reference(cut, view), actual = td09Events.durableCutCorrespondsToValidatedPrefix(cut, view);
    assert.equal(actual, reference, `${label}: the reader differs from the base comparison`);
    assert.equal(reference, expected, `${label}: the pair decides what it names`);
    checked.push(label);
  };
  // Equal: the located and array views of the cut, and a cold equal copy, each twice.
  for (const round of [1, 2]) {
    pair(`equal, located view ${round}`, cut1, a.located(2), true);
    pair(`equal, array view ${round}`, cut1, array, true);
    pair(`equal, cold copy of the rows ${round}`, cut1, cold(), true);
  }
  // Other cuts of the same history, each with a view recorded for another cut: the record is per cut.
  const shorterCut = td09Events.durableRuntimeEventPrefixThroughEvent(current1, a.ids[1]), longerCut = td09Events.durableRuntimeEventPrefixThroughEvent(current1, a.ids[3]);
  for (const round of [1, 2]) {
    pair(`shorter cut, its own view ${round}`, shorterCut, a.located(1), true);
    pair(`shorter cut, a view recorded for a longer cut ${round}`, shorterCut, a.located(2), false);
    pair(`longer cut, a view recorded for a shorter cut ${round}`, longerCut, array, false);
    pair(`longer cut, another view recorded for a shorter cut ${round}`, longerCut, a.located(1), false);
  }
  // Refusals, each evaluated twice: a shorter and a longer view, one changed body.
  for (const round of [1, 2]) {
    pair(`one event shorter ${round}`, cut1, a.located(1), false);
    pair(`one event longer ${round}`, cut1, a.located(3), false);
    pair(`one changed body ${round}`, cut1, changed.located(2), false);
  }
  // Copied coordinates have no record: the physical read, as at the base.
  pair('copied coordinate', clone(cut1), a.located(2), true);
  pair('captured copy', td09Events.captureDurablePrefixCoordinate(clone(cut1)), array, true);
  pair('copied coordinate with another profile', { ...clone(cut1), storeIdentity: { ...cut1.storeIdentity, eventContractDigest: hash('other-profile') } }, array, false);
  // Coordinates from another store: their own owner and index.
  const changedCut = td09Events.durableRuntimeEventPrefixThroughEvent(changed.current(), changed.ids[2]);
  const sameCut = td09Events.durableRuntimeEventPrefixThroughEvent(same.current(), same.ids[2]);
  pair('another store, one changed body', changedCut, a.located(2), false);
  pair('another store, equal rows', sameCut, a.located(2), true);
  pair('another store, equal rows, repeated', sameCut, array, true);
  // The store grows: the same cut from the earlier and the later current coordinate.
  const current2 = a.append();
  const cut2 = td09Events.durableRuntimeEventPrefixThroughEvent(current1, a.ids[2]), cut3 = td09Events.durableRuntimeEventPrefixThroughEvent(current2, a.ids[2]);
  assert.notEqual(cut2, cut1); assert.equal(cut2.coordinateDigest, cut1.coordinateDigest); assert.equal(cut3.coordinateDigest, cut1.coordinateDigest);
  pair('grown store, cut from the earlier current', cut2, a.located(2), true);
  pair('grown store, cut from the later current', cut3, array, true);
  pair('grown store, one event shorter', cut3, a.located(1), false);
  // Reads of the view's rows (every property, descriptor and key read of a row
  // object): the second read of an equal owned cut with the same view reads none.
  const counter = td09RowReads(), wrapped = prefixes.selectValidatedRuntimeEventPrefix(Object.freeze(clone(rows.slice(0, 3)).map(row => counter.wrap(deepFreeze(row)))));
  const firstRead = counter.measure(() => td09Events.durableCutCorrespondsToValidatedPrefix(cut3, wrapped));
  const repeated = counter.measure(() => td09Events.durableCutCorrespondsToValidatedPrefix(td09Events.durableRuntimeEventPrefixThroughEvent(current2, a.ids[2]), wrapped));
  const reference = counter.measure(() => td09Reference(cut3, wrapped));
  assert.deepEqual([firstRead.value, repeated.value, reference.value], [true, true, true]);
  assert.ok(firstRead.reads > 0, 'a new view object is read once, for its exact prefix digest');
  assert.equal(repeated.reads, 0, 'a repeated read of an equal owned cut with the same view compares and copies no view row');
  assert.ok(reference.reads > 0, 'the base comparison reads the view rows to admit and compare them');
  // Closed owner: the same exact cut takes the physical read, which refuses changed bytes.
  a.close();
  pair('closed owner, unchanged bytes', cut1, array, true);
  const bytes = await fs.readFile(a.path, 'utf8'), at = bytes.indexOf('2026-10-25T00:00:00.000Z');
  assert.ok(at >= 0 && at < cut1.prefixLength);
  await fs.writeFile(a.path, bytes.slice(0, at) + '2026-10-25T00:00:00.001Z' + bytes.slice(at + 24));
  pair('closed owner, changed bytes', cut1, array, false);
  pair('closed owner, changed bytes, cut from the later current', cut3, a.located(2), false);
  pair('copied coordinate, changed bytes', clone(cut1), array, false);
  t.diagnostic(`TD-09 equivalence: ${checked.length} pairs; view-row reads: first read ${firstRead.reads} (its digest), repeated read ${repeated.reads}, base comparison ${reference.reads}`);
});

const c14Frozen = (v) => { if (v && typeof v === 'object') { Object.values(v).forEach(c14Frozen); Object.freeze(v); } return v; };
const c14Row = (kind, eventId, admissionOrdinal, extra = {}) => c14Frozen({ kind, eventTime: '2026-07-21T00:00:00.000Z',
  aggregateType: 'workspace', aggregateId: 'workspace://c14', parentAggregateId: null, causationEventRefs: [],
  correlationId: 'correlation://c14', workflowVersion: '5.0.0', scopeClass: 'workspace', basisId: 'basis://c14', payload: {},
  eventId, admissionOrdinal, payloadDigest: `sha256:${'0'.repeat(64)}`, ...extra });

test('C-14: the C0 failure evidence check refuses its one cited row by order; the owner answer stays null', async () => {
  const { sha256Canonical } = await import('../../build/code/src/shared/digests.js');
  const { projectWorksiteFailureResultRequest } = await import('../../build/code/src/abg/c_call_outcome.js');
  const { WORKSITE_C0_IDS } = await import('../../build/code/src/gtl/worksite_c0.js');
  const value = { code: 'c14_refusal' }, refs = ['evidence://abiogenesis/c14'];
  const body = { resultClass: 'failure', cCallRef: 'ccall://c14', contractRef: WORKSITE_C0_IDS.failureContractRef,
    valueKind: 'worksite_effect_refusal', value, valueDigest: sha256Canonical(value), evidenceRefs: refs };
  const resultDigest = sha256Canonical(body);
  const scope = { basisId: 'basis://c14', runId: 'run://c14', graphCallId: 'graph-call://c14', frameId: 'frame://c14',
    aggregateType: 'c_call', aggregateId: 'ccall://c14', scopeClass: 'run' };
  const result = c14Row('c_call_result_admitted', 'event://c14/result', 2, { ...scope, causationEventRefs: ['event://c14/evidence'],
    payload: { ...body, resultRef: `result://abiogenesis/${resultDigest.slice(7)}`, resultDigest } });
  // The one cited evidence row is admitted after the Result: the evidence check refuses it.
  const evidence = c14Row('c_call_evidenced', 'event://c14/evidence', 3, { ...scope,
    payload: { evidenceRef: refs[0], evidenceClass: 'deterministic' } });
  assert.equal(projectWorksiteFailureResultRequest(result, [evidence]), null);
});
