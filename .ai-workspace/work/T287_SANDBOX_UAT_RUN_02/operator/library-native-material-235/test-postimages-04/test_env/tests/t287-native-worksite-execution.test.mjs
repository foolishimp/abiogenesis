import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
import * as p from '../../build/code/src/product/index.js';
import { constructNativeWorkspaceWorkObservation } from '../../build/code/src/product/native_workspace_work.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { selectValidatedRuntimeEventPrefix, selectOwnedRuntimeEventPrefix, readOwnedRuntimeEventPrefixAtDurablePrefix,
  validatedRuntimeEventPrefixBeforeEvent } from '../../build/code/src/abg/event_prefix.js';
import { createNewEmptyAppendSink, admitRuntimeEvent, admitRuntimeEventBatch,
  selectHeldEventStoreDurablePrefix } from '../../build/code/src/abg/event_store.js';
import { projectNativeWorkCommandSourceAtPrefix } from '../../build/code/src/abg/native_worksite_execution.js';
import { deriveInvocationSourceResultBasisAtPrefix } from '../../build/code/src/abg/invocation_admission.js';
import { projectExactInvocationAdmissionAtPrefix } from '../../build/code/src/abg/invocation_execution_truth.js';
import { ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS as semantics } from '../../build/code/src/product/builtin_semantics.js';
import { realizeWorksiteCommandExecution } from '../../build/code/src/implementation/worksite_command_execution.js';
import { worksiteCommandExecutionHelperPlan, renderWorksiteCommandExecutionPrompt,
  worksiteCommandExecutionWorkerResultSchema } from '../../build/code/src/product/worksite_command_execution.js';
const owner = await loadWorksiteOwner();
const ids = p.WORKSITE_COMMAND_EXECUTION_IDS;
const hash = value => owner.sha256Canonical(value);
function inputFor(source, paths) {
  return { workspaceAuthorityBasis: source.task.workspaceAuthorityBasis, workspaceBinding: source.task.workspaceBinding,
    capabilityGrant: source.task.capabilityGrant, sourceNativeWork: source,
    selectedSources: paths.map(relativePath => ({ relativePath,
      subjectUri: pathToFileURL(join(source.task.workspaceAuthorityBasis.canonicalRoot, relativePath)).href })),
    commands: [{ commandId: 'command://native-c2/component', executable: 'node', args: ['--version'], relativeCwd: '.',
      environment: {}, timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }],
    outcomePredicates: [{ predicateId: 'predicate://native-c2/exit', predicateKind: 'process_exit',
      declaration: { equals: 0, validationCommandId: 'command://native-c2/component' } }],
    allowedWriteTerritories: [{ pathKind: 'subtree', relativePath: 'evidence' }] };
}
async function fixture(t) {
  const env = await worksiteFixture(owner); t.after(() => fs.rm(env.scratch, { recursive: true, force: true }));
  await fs.writeFile(join(env.canonicalRoot, 'changed.txt'), 'before');
  await fs.writeFile(join(env.canonicalRoot, 'unchanged.txt'), 'retained');
  const observe = () => owner.observeWorksiteContext({ ...env, readRoots: ['changed.txt', 'unchanged.txt'], maxFiles: 2, maxBytes: 1000 });
  const task = p.constructNativeWorkspaceWorkTask({ workspaceAuthorityBasis: env.workspaceAuthorityBasis, workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant, context: await observe(), outcome: 'local edit', instructions: ['Preserve retained source.'],
    readFirst: ['changed.txt'], writeRoots: ['changed.txt'], checks: [] });
  await fs.writeFile(join(env.canonicalRoot, 'changed.txt'), 'after');
  // Cold Product value only. The ABG absent-source check below refuses it.
  const source = constructNativeWorkspaceWorkObservation(task, await observe(), { summary: 'edited', gaps: [] }, {
    cCallRef: 'c-call://native-c2/component', executionAuthorityRef: 'authority://native-c2/component', executionAuthorityDigest: hash({ a: 1 }),
    actorInvocationRef: 'actor-invocation://native-c2/component', transportBindingRef: 'transport://native-c2/component',
    transportBindingDigest: hash({ t: 1 }), promptDigest: hash({ p: 1 }), transportDigest: hash({ t: 2 }) });
  return { ...env, source, input: inputFor(source, ['changed.txt', 'unchanged.txt']) };
}
test('native C2 selects changed and unchanged files without acquiring C1 identity', async t => {
  const env = await fixture(t), task = p.constructNativeWorksiteCommandExecutionTask(env.input);
  assert.equal(p.isC2WorksiteCommandExecutionTask(task), true);
  assert.equal(p.isWorksiteCommandExecutionTask(task), false);
  assert.equal('sourceConstructionResult' in task, false);
  assert.deepEqual(task.protectedObservations.map(r => r.subject.relativePath), ['changed.txt', 'unchanged.txt']);
  assert.equal(task.protectedObservations[1].observation.fileDigest, env.source.after.entries.find(e => e.relativePath === 'unchanged.txt').digest);
  assert.equal(p.isNativeWorksiteCommandExecutionTask(JSON.parse(JSON.stringify(task))), true);
  assert.deepEqual(semantics.resolveProbabilisticWorkerContracts({ inputContractRef: ids.taskContractRef,
    outputContractRef: ids.observationContractRef, input: task }), { instructionContractRef: ids.taskContractRef, resultContractRef: ids.workerResultContractRef });
  const plan = worksiteCommandExecutionHelperPlan(task, 'attempt://native-c2/component');
  const prompt = renderWorksiteCommandExecutionPrompt(task, plan);
  assert(prompt.includes(env.source.observationRef)); assert(!prompt.includes('sourceConstructionResultRef'));
  assert.equal(worksiteCommandExecutionWorkerResultSchema(task, plan).properties.taskDigest.const, task.taskDigest);
});
test('native C2 refuses missing, duplicate, crossed and counterfeit source selections', async t => {
  const env = await fixture(t);
  for (const patch of [{ selectedSources: [] }, { selectedSources: [...env.input.selectedSources, env.input.selectedSources[0]] },
    { selectedSources: [{ relativePath: 'missing.txt', subjectUri: pathToFileURL(join(env.canonicalRoot, 'missing.txt')).href }] },
    { workspaceBinding: { ...env.workspaceBinding, bindingId: 'workspace-binding://foreign' } }])
    assert.throws(() => p.constructNativeWorksiteCommandExecutionTask({ ...env.input, ...patch }));
  const task = p.constructNativeWorksiteCommandExecutionTask(env.input);
  assert.equal(p.isNativeWorksiteCommandExecutionTask({ ...task, sourceConstructionResult: {} }), false);
  assert.equal(projectNativeWorkCommandSourceAtPrefix(selectValidatedRuntimeEventPrefix(deepFreeze([])), task), null);
});
test('changed physical source refuses before archive publication or native dispatch', async t => {
  const env = await fixture(t), task = p.constructNativeWorksiteCommandExecutionTask(env.input);
  await fs.writeFile(join(env.canonicalRoot, 'unchanged.txt'), 'later contents');
  assert.throws(() => realizeWorksiteCommandExecution(task, { cCallRef: 'c-call://native-c2/currentness', runId: 'run://native-c2/component',
    graphCallId: 'graph-call://native-c2/component', frameId: 'frame://native-c2/component', programLocusRef: ids.nodeRef,
    taskOrdinal: null, attempt: 1, executionAuthority: null }), /protected worksite observation changed/);
  await assert.rejects(fs.stat(env.workspaceBinding.roots.archiveRoot), { code: 'ENOENT' });
});
test('native source selection preserves complete values and exact membership across long producer history and cold coordinates',async t=>{
  const env=await fixture(t),task=p.constructNativeWorksiteCommandExecutionTask(env.input),source=env.source;
  const path=join(env.scratch,'native-source-selection.jsonl'),opened=createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});
  assert(opened.store);t.after(()=>opened.store.closeDurableLog());
  const basis={basisRef:'execution-basis://selected-native/source',graphFunctionRef:p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef,
    rawInputValue:source.task,workspaceBindingId:env.workspaceBinding.bindingId,workspaceBindingDigest:env.workspaceBinding.bindingDigest,
    invocationAdmissionRef:'invocation://selected-native',closureContractRef:'closure://selected-native'};
  // Real Product values and finite EventStore/codec/cold reads. Invocation and
  // execution-basis lookup are disclosed lower premises, not F_P admission.
  const file=new URL('../../build/code/src/abg/native_worksite_execution.js',import.meta.url),module=new SourceTextModule(await fs.readFile(file,'utf8'),{identifier:file.pathname});
  let namedReads=0,extentReads=0;
  await module.link(async specifier=>{
    const native=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file.pathname),specifier)).href);
    const values={...native,
      ...(specifier==='./invocation_execution_truth.js'?{
        projectExactExecutionBasisAtPrefix:(_prefix,ref)=>ref===basis.basisRef?basis:null,
        projectExactInvocationAdmissionAtPrefix:()=>({workspaceId:env.workspaceAuthorityBasis.workspaceId,
          workspaceBindingId:env.workspaceBinding.bindingId,workspaceBindingDigest:env.workspaceBinding.bindingDigest})}:{}),
      ...(specifier==='./event_prefix.js'?{
        runtimeEventAtPrefix:(...args)=>{namedReads++;return native.runtimeEventAtPrefix(...args);},
        runtimeEventSelectorExtent:(...args)=>{extentReads++;return native.runtimeEventSelectorExtent(...args);}}:{})};
    return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});
  });await module.evaluate();
  const projection=module.namespace.projectNativeWorkspaceWorkSourceAtPrefix,admittedTask=module.namespace.admittedNativeTask;
  const candidate=(kind,payload,{aggregateType='c_call',aggregateId=source.provenance.cCallRef,parentAggregateId=null,causationEventRefs=[],basisId=basis.basisRef,...extra}={})=>({
    kind,payload,eventTime:'2026-10-10T00:00:00.000Z',aggregateType,aggregateId,parentAggregateId,causationEventRefs,
    correlationId:'correlation://selected-native',workflowVersion:'5.0.0',scopeClass:'run',basisId,
    runId:'run://selected-native',graphCallId:'graph-call://selected-native',frameId:'frame://selected-native',graphFunctionRef:basis.graphFunctionRef,...extra});
  const admit=(...args)=>admitRuntimeEvent(opened.store,candidate(...args));
  admitRuntimeEventBatch(opened.store,[()=>candidate('c_call_opened',{cCallRef:source.provenance.cCallRef,cCallDigest:hash('source-call'),callClass:'leaf'}),
    prior=>candidate('c_call_fibre_selected',{cCallRef:source.provenance.cCallRef,callClass:'leaf',armId:'arm://selected-native',
      regime:'F_P',implementationRef:p.NATIVE_WORKSPACE_WORK_IDS.implementationRef,
      implementationBindingRef:p.NATIVE_WORKSPACE_WORK_IDS.implementationBindingRef},{causationEventRefs:[prior.at(-1).eventId]})]);
  const producerRows=512;
  for(let i=0;i<producerRows;i++)admit('actor_process_stdout_observed',{actorInvocationRef:'actor-invocation://selected-native',
    processRef:'process://selected-native',streamOrdinal:i+1,chunkDigest:hash(i),byteLength:37},
    {aggregateType:'process',aggregateId:'process://selected-native',parentAggregateId:'actor-invocation://selected-native'});
  const evidence=admit('c_call_evidenced',{cCallRef:source.provenance.cCallRef,contractRef:p.NATIVE_WORKSPACE_WORK_IDS.observationContractRef,
    evidenceRef:'evidence://selected-native',evidenceDigest:hash('evidence'),evidenceClass:'probabilistic_transport',
    implementationRef:p.NATIVE_WORKSPACE_WORK_IDS.implementationRef,inputDigest:hash(source.task),
    transportDigest:source.provenance.transportDigest,outputDigest:hash(source)});
  const result=admit('c_call_result_admitted',{cCallRef:source.provenance.cCallRef,resultClass:'success',contractRef:p.NATIVE_WORKSPACE_WORK_IDS.observationContractRef,
    value:source,valueDigest:hash(source),evidenceRefs:[evidence.payload.evidenceRef],resultRef:'result://selected-native',resultDigest:hash('result')});
  const judgmentPayload={cCallRef:source.provenance.cCallRef,judgmentRef:'judgment://selected-native',judgmentDigest:hash('judgment'),
    resultRef:result.payload.resultRef,resultDigest:result.payload.resultDigest,judgment:'advance',retryAttemptRef:null};
  const judgment=admit('c_call_judged',judgmentPayload,{causationEventRefs:[result.eventId]});
  const frame=admit('frame_closed',{frameId:'frame://selected-native',terminalReachedEventRef:judgment.eventId},
    {aggregateType:'frame',aggregateId:'frame://selected-native',causationEventRefs:[judgment.eventId]});
  const closed=admit('graph_call_closed',{closureContractRef:basis.closureContractRef,graphCallId:'graph-call://selected-native',frameClosedEventRef:frame.eventId},
    {aggregateType:'graph_call',aggregateId:'graph-call://selected-native',causationEventRefs:[frame.eventId]});
  admit('basis_admitted',{basisRef:'execution-basis://selected-task',basisDigest:hash('task-basis'),basisClass:'child',rawInputValue:task},
    {aggregateType:'frame',aggregateId:'frame://selected-task',basisId:'execution-basis://selected-task'});
  const owned=()=>selectOwnedRuntimeEventPrefix(opened.store),complete=()=>selectValidatedRuntimeEventPrefix(opened.store.readAll());
  const expected=projection(complete(),source);assert(expected);
  assert.deepEqual(projection(owned(),source),expected);
  assert.deepEqual(admittedTask(owned(),JSON.parse(JSON.stringify(task))),task);
  assert.equal(admittedTask(owned(),{...task,taskDigest:hash('changed')}),null);
  namedReads=0;extentReads=0;const warmStarted=performance.now();assert.deepEqual(projection(owned(),source),expected);
  const warmMs=performance.now()-warmStarted,beforeGrowth=namedReads,beforeExtents=extentReads;
  assert.ok(beforeExtents>0&&beforeExtents<=3,'long completed producer membership uses bounded exact owner extents');
  for(let i=0;i<64;i++)admit('public_operation_admitted',{invocationRef:'invocation://unrelated/'+i,invocationDigest:hash(i),
    operationId:'abg.operation.project.read',variant:'status'},
    {aggregateType:'workspace',aggregateId:'workspace://unrelated/'+i,basisId:'basis://unrelated/'+i});
  namedReads=0;extentReads=0;assert.deepEqual(projection(owned(),source),expected);
  assert.equal(namedReads,beforeGrowth,'unrelated history does not increase named source-body reads');
  assert.equal(extentReads,beforeExtents,'unchanged producer versions do not reopen complete membership derivation');
  assert.throws(()=>projection({...owned()},source));
  const completeRows=opened.store.readAll(),coordinate=structuredClone(selectHeldEventStoreDurablePrefix(opened.store));
  admit('c_call_judged',{...judgmentPayload,judgmentRef:'judgment://duplicate-native',judgmentDigest:hash('duplicate')},
    {causationEventRefs:[result.eventId]});
  assert.equal(projection(owned(),source),null,'changed authentic membership reopens duplicate-judgment refusal');
  opened.store.closeDurableLog();
  const cold=readOwnedRuntimeEventPrefixAtDurablePrefix(coordinate);
  assert.deepEqual(projection(cold,source),expected);assert.deepEqual(admittedTask(cold,JSON.parse(JSON.stringify(task))),task);
  const counterexample=deepFreeze([...completeRows,{...judgment,eventId:'event://duplicate-native-judgment',
    admissionOrdinal:completeRows.length+1,causationEventRefs:[result.eventId]}]);
  assert.equal(projection(selectValidatedRuntimeEventPrefix(counterexample),source),null,'duplicate advancing producer judgment refuses');
  assert.equal(projection(validatedRuntimeEventPrefixBeforeEvent(cold,closed.eventId),source),null,'missing source closure refuses');
  const crossed=p.constructNativeWorkspaceWorkObservation(source.task,source.after,source.report,{...source.provenance,cCallRef:'c-call://foreign-native'});
  assert.equal(projection(cold,crossed),null);
  t.diagnostic(JSON.stringify({kind:'native_source_selection_component',eventCount:completeRows.length,logBytes:coordinate.prefixLength,namedReads:beforeGrowth,
    producerRows,unrelatedRows:64,warmMembershipExtentReads:beforeExtents,warmMs,completeValuesConserved:true,nativeAdmission:false,
    premises:'Invocation/execution lookup supplied; actual Product source/task predicates, EventStore, indexes, codec, source uniqueness and cold physical owner execute.'}));
});
const retainedPath = process.env.ABG_NATIVE_EXECUTION_RETAINED_LOG;
test('retained actual native producer joins C2 source admission; absent and foreign origins refuse', { skip: retainedPath === undefined }, async t => {
  const start = performance.now();
  const bytes = await fs.readFile(retainedPath), events = deepFreeze(bytes.toString('utf8').trim().split('\n').map(JSON.parse));
  const prefix = selectValidatedRuntimeEventPrefix(events), parsed = performance.now();
  const result = events.find(e => e.kind === 'c_call_result_admitted' && e.graphFunctionRef === p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef &&
    e.payload.value?.kind === 'native_workspace_work_observation');
  assert(result);
  const source = result.payload.value;
  const paths = source.after.entries.filter(e => e.state === 'file' && !e.relativePath.startsWith('.abiogenesis/')).map(e => e.relativePath);
  const task = p.constructNativeWorksiteCommandExecutionTask(inputFor(source, paths));
  const projection = projectNativeWorkCommandSourceAtPrefix(prefix, task), projected = performance.now();
  assert(projection); assert.equal(projection.sourceResult.eventId, result.eventId);
  assert.equal(projectNativeWorkCommandSourceAtPrefix(validatedRuntimeEventPrefixBeforeEvent(prefix, result.eventId), task), null);
  const otherSource = constructNativeWorkspaceWorkObservation(source.task, source.after, source.report,
    { ...source.provenance, cCallRef: 'c-call://native-c2/foreign' });
  assert.equal(projectNativeWorkCommandSourceAtPrefix(prefix, p.constructNativeWorksiteCommandExecutionTask(inputFor(otherSource, paths))), null);
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, projection.sourceBasis.invocationAdmissionRef);
  assert(invocation);
  const basis = deriveInvocationSourceResultBasisAtPrefix(prefix, { publicAuthorityDigest: invocation.publicRequestDigest,
    invocationAdmissionRef: invocation.invocationAdmissionRef, runtimeInvocationRef: invocation.invocationRef,
    runId: result.runId, resultRef: result.payload.resultRef });
  assert(basis);
  const admission = { input: task, sourceResultBasis: basis, workspaceId: task.workspaceBinding.workspaceId,
    workspaceBindingId: task.workspaceBinding.bindingId, workspaceBindingDigest: task.workspaceBinding.bindingDigest };
  assert.equal(semantics.validateInvocationBasis(admission), true);
  assert.equal(semantics.validateInvocationBasis({ ...admission, sourceResultBasis: null }), false);
  assert.equal(semantics.validateInvocationBasis({ ...admission, sourceResultBasis: { ...basis, sourceCCallRef: 'c-call://foreign' } }), false);
  t.diagnostic(JSON.stringify({ retainedPath, bytes: bytes.length, events: events.length, sourceResult: result.eventId,
    sourceTaskDigest: hash(source.task), selectedFiles: paths.length, readParseValidateMs: parsed - start,
    constructionAndSourceProjectionMs: projected - parsed, wholeCheckMs: performance.now() - start,
    limit: 'Historical admitted source and current pure source/admission predicates; no new C2 Run, child admission, helper execution or native call.' }));
});

// Projection counterexample, not a new admitted Run: preserve the real source
// prefix and append canonical event fixtures for the C2 cut and later residue.
test('native source currentness includes admitted failed-write residue after the child basis cut', { skip: retainedPath === undefined }, async t => {
  const { projectRuntimeEventFromValidatedHistory } = await import('../../build/code/src/abg/event_store.js');
  const { isNativeWorkspaceWorkFailure } = await import('../../build/code/src/product/native_workspace_work.js');
  const all = deepFreeze((await fs.readFile(retainedPath, 'utf8')).trim().split('\n').map(JSON.parse));
  const result = all.find(e => e.kind === 'c_call_result_admitted' && e.graphFunctionRef === p.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef &&
    e.payload.value?.kind === 'native_workspace_work_observation');
  const source = result.payload.value;
  const closed = all.find(e => e.kind === 'graph_call_closed' && e.graphCallId === result.graphCallId);
  const history = all.filter(e => e.admissionOrdinal <= closed.admissionOrdinal);
  const selectedPath = source.changedPaths.find(path => source.after.entries.some(e => e.relativePath === path && e.state === 'file'));
  assert(selectedPath);
  const task = p.constructNativeWorksiteCommandExecutionTask(inputFor(source, [selectedPath]));
  const candidateOf = event => {
    const { eventId, admissionOrdinal, payloadDigest, eventContractDigest, ...candidate } = event;
    return candidate;
  };
  const originalBasis = all.find(e => e.eventId === projectNativeWorkCommandSourceAtPrefix(
    selectValidatedRuntimeEventPrefix(deepFreeze(history)), task).sourceBasis.admissionEventRef);
  const childBasisRef = 'execution-basis://native-c2/counterexample-child';
  const childBasis = projectRuntimeEventFromValidatedHistory(history, { ...candidateOf(originalBasis),
    basisId: childBasisRef, causationEventRefs: [closed.eventId],
    payload: { ...originalBasis.payload, basisRef: childBasisRef, rawInputValue: task, rawInputDigest: hash(task) } });
  const beforeResidue = deepFreeze([...history, childBasis]);
  const { kind, schemaVersion, observationRef, observationDigest, ...contextBody } = source.after;
  const replacement = Buffer.from('later failed-write residue\n');
  const changedBody = { ...contextBody, entries: contextBody.entries.map(e => e.relativePath === selectedPath
    ? { ...e, bytes: replacement.toString('base64'), byteLength: replacement.length, digest: owner.sha256Bytes(replacement) } : e) };
  const changedDigest = hash(changedBody);
  const after = { kind, schemaVersion, observationRef: `worksite-context-observation://abiogenesis/${changedDigest.slice(7)}`,
    observationDigest: changedDigest, ...changedBody };
  const failure = { kind: 'native_workspace_work_failure', schemaVersion: '5.0.0', failureClass: 'result_contract_failure',
    diagnosticRef: 'diagnostic://native-c2/counterexample-residue', task: { ...source.task, context: source.after },
    before: source.after, after, changedPaths: [selectedPath], observationFailure: null, report: null,
    provenance: { ...source.provenance, cCallRef: 'c-call://native-c2/later-failed-writer',
      actorInvocationRef: 'actor-invocation://native-c2/later-failed-writer' } };
  assert.equal(isNativeWorkspaceWorkFailure(failure), true);
  const residue = projectRuntimeEventFromValidatedHistory(beforeResidue, { ...candidateOf(result),
    aggregateId: failure.provenance.cCallRef, causationEventRefs: [childBasis.eventId],
    payload: { ...result.payload, cCallRef: failure.provenance.cCallRef, contractRef: p.NATIVE_WORKSPACE_WORK_IDS.failureContractRef,
      resultClass: 'failure', valueKind: failure.kind, value: failure, valueDigest: hash(failure) } });
  const held = selectValidatedRuntimeEventPrefix(deepFreeze([...beforeResidue, residue]));
  const historical = validatedRuntimeEventPrefixBeforeEvent(held, childBasis.eventId);
  // NATIVEEXEC01 supplied this historical cut and therefore missed the residue.
  assert(projectNativeWorkCommandSourceAtPrefix(historical, task));
  // NATIVEEXEC02 supplies the latest held prefix before effects.
  assert.equal(projectNativeWorkCommandSourceAtPrefix(held, task), null);
  t.diagnostic(JSON.stringify({ sourceOrdinal: result.admissionOrdinal, childBasisOrdinal: childBasis.admissionOrdinal,
    laterFailureOrdinal: residue.admissionOrdinal, selectedPath, historicalCutAccepts: true, latestHeldPrefixRefuses: true,
    limit: 'Pure owner projection over canonical counterexample event fixtures; no new runtime admission or physical write.' }));
});
