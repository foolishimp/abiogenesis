import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createU1Fixture, product, hash, ids, identity, clone, current, component, traceInvalidator, admittedResult, admitNativeSource, semanticFixtureHelpers } from '../support/t287-native-work-currentness-consumers.mjs';
import * as p from '../../build/code/src/product/index.js';
import * as g from '../../build/code/src/gtl/index.js';
import * as calculus from '../../build/code/src/abg/event_calculus.js';
import * as prefixes from '../../build/code/src/abg/event_prefix.js';
import * as nativeOwner from '../../build/code/src/abg/native_worksite_execution.js';
import { projectNativeWorkUnknownEffectTask } from '../../build/code/src/abg/native_work_effect.js';
import { selectHeldEventStoreDurablePrefix } from '../../build/code/src/abg/event_store.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';

const results = [], fixtures = [], attempts = [], physicalFacts = [], gateTraces = [], gateOutputs = [];
const CASE_NAMES = ['c0', 'observed', 'governance', 'semanticFold', 'revisionIntake', 'revisionEvidence'];
const FIRST_CASE = process.env.ABG_U1_FIRST_CASE ?? 'c0';
if (!CASE_NAMES.includes(FIRST_CASE)) throw new TypeError('unknown ABG_U1_FIRST_CASE');
const selectedCases = CASE_NAMES.slice(CASE_NAMES.indexOf(FIRST_CASE)), omittedCases = CASE_NAMES.slice(0, CASE_NAMES.indexOf(FIRST_CASE));
let proofSucceeded = false;
const preserveOnFailure = t => ({ after(callback) { t.after(async () => { if (proofSucceeded) await callback(); }); } });
const traced = label => { const trace = traceInvalidator(); gateTraces.push({ label, calls: trace.calls }); return trace; };
const observed = (owner, output) => { gateOutputs.push({ owner, output }); return output; };
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
const retain = async () => {
  if (!process.env.ABG_U1_EVIDENCE_DIR) return;
  await fs.mkdir(process.env.ABG_U1_EVIDENCE_DIR, { recursive: true });
  await fs.writeFile(join(process.env.ABG_U1_EVIDENCE_DIR, 'consumer-results.json'), JSON.stringify({ results, physicalFacts, gateTraces, gateOutputs, selectedCases, omittedCases, cleanupOnSuccessOnly: true,
    attempts: await Promise.all(attempts.map(async a => ({ scratch: a.scratch, canonicalRoot: a.canonicalRoot, otherScratch: a.otherScratch,
      prefix: a.rows ? a.rows() : null, candidates: a.candidates ?? null, physical: await physicalInventory(a.canonicalRoot) }))),
    fixtures: fixtures.map(f => ({ canonicalRoot: f.canonicalRoot, workspaceBinding: f.workspaceBinding,
      task: f.task, admittedPrefix: f.rows(), candidates: f.candidates })) }, null, 2) + '\n');
};
const selected = async (t, roots = ['target.txt'], options) => {
  const f = await createU1Fixture(preserveOnFailure(t), roots, { ...options, onAttempt: attempt => { attempts.push(attempt); } }); fixtures.push(f); return f;
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
    assessment: { sources: [path], candidatePath: path, rubricPath: path, resultContract: assessmentContract,
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
  const gate = await component('abg/default_library', {
    './execution_basis.js': { authenticateOwnedNativeInstructionAssemblyBasis: () => owned },
    './native_worksite_execution.js': { worksiteCommandSourcesInvalidatedAfter: trace.worksiteCommandSourcesInvalidatedAfter,
      projectNativeWorkspaceWorkSourceAtPrefix: (prefix, value) => nativeOwner.projectNativeWorkspaceWorkSourceAtPrefix(prefix, value) ?? assessedSources.get(value.observationRef) ?? null },
  });
  const environment = { kind: 'exact_prefix_workspace_environment', workspaceAuthorityBasis: f.workspaceAuthorityBasis,
    workspaceBinding: f.workspaceBinding, productInstalls: [] };
  for (const path of ['target.txt', 'keep.txt']) {
    const { state, context } = await governanceInput(f, path);
    const task = p.constructNativeWorkspaceWorkTask({ ...f, context, ...state.original.workOrders.construction });
    const native = await admitNativeSource(f, task, 'governance-' + path, { basisExtra: { rootImplementationSetRef: 'implementation-set://u1/governance/' + path } });
    const root = f.atCut(() => f.basisFor(f, f.inv, state, { implementationSetRef: 'implementation-set://u1/governance/' + path }));
    const execution = { ...native.basis, rootImplementationSetRef: root.implementationSetRef };
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
    const assessment = { kind: assessmentContract.valueKind, disposition: 'satisfied', reason: 'Controlled scalar verdict; no semantic UAT credit', unresolvedCriteria: [] };
    const provenance = { ...native.source.provenance, cCallRef: 'c-call://u1/assessment/' + path, actorInvocationRef: 'actor://u1/assessor/' + path };
    const assessed = p.constructNativeWorkspaceWorkObservation(uat, context, null, provenance, assessment);
    assert.equal(p.isNativeWorkspaceWorkObservation(assessed), true);
    const a = admittedResult(f, assessed, { callRef: provenance.cCallRef, contractRef: ids.observationContractRef,
      scope: { basisId: native.basis.basisRef } });
    // Only the independent assessment producer's prior-source provenance is a
    // supplied lower premise. Its immutable Product observation and actual
    // admitted Result remain exact; no assessment actor or verifier ran here.
    assessedSources.set(assessed.observationRef, { sourceBasis: native.basis });
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
  const job = p.constructSemanticJobInput({ ...env.job, worksiteScope: { ...env.job.worksiteScope,
    readRoots: ['assets', 'app', ...env.job.members.map(m => m.path)] } });
  env.job = job;
  env.observe = () => product.observeWorksiteContext({ ...env, readRoots: job.worksiteScope.readRoots,
    maxFiles: helpers.declaration.bounds.maxContextFiles, maxBytes: helpers.declaration.bounds.maxContextBytes });
  const f = await selected(t, roots, { environment: env });
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
  return { owner, trace, basis, root, environment, states, bases, lookup, leaf, executionOverrides, admit, setOwner, get owned() { return owned; } };
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
    const execution = { ...h.root, basisRef: 'basis://u1/revision-intake', rawInputValue: intake, rawInputDigest: hash(intake),
      rawInputAdmissionRef: 'input://u1/revision-intake' }; h.bases.set(execution.basisRef, execution);
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
    const commandTask = semantic.constructNativeSemanticExecutionTask(design, construction.source);
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
    const execution = { ...h.root, basisRef: 'basis://u1/selection', rawInputValue: request, rawInputDigest: hash(request) };
    h.bases.set(execution.basisRef, execution);
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
