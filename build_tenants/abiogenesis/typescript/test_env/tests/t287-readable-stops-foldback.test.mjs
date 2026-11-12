import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import * as product from '../../build/code/src/product/index.js';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {declarations,initialState,ref,contract,hash} from '../fixtures/registered-selection-product/recursive.mjs';

// REQ-P-POLICY-065–068 over a declared child failure foldback. One installed
// Product, four Public starts through the installed CLI: a handled failure
// that later closes, a handled failure every time until the recursion bound,
// an undeclared failure, and a handled failure followed by an undeclared
// failure of the next child. The origin is read by the references the events
// carry; a handled failure is never an origin; a frame ended by a stopped
// foldback never reads live and its GraphCall never reads closed.
// The fixture below is the declared-foldback stand-in of
// t287-recursive-failure-foldback.test.mjs, reproduced exactly except for the
// added handled-then-undeclared scenario of A.
const packageRoot=new URL('../..',import.meta.url).pathname;
const declared='diagnostic://registered-selection/declared-child-failure@5',undeclared='diagnostic://registered-selection/undeclared-child-failure@5';
const boundExhausted='reason://abiogenesis/recursion/bound-exhausted@5';

const declaring=g=>({...g,recurseApplication:input=>g.recurseApplication({...input,foldback:{...input.foldback,failedChildDiagnosticClassRefs:[declared]}})});
function foldbackDeclarations(g){
  const d=declarations(declaring(g)),root=d.graphFunctions[0],A=d.graphFunctions[1],parent=d.graphFunctions.at(-1);
  root.template={kind:'inline_graph',graphRef:ref('graph','root'),startNodeRef:ref('node','call-A'),terminalNodeRefs:[ref('node','call-A')],
    nodes:[{nodeRef:ref('node','call-A'),nodeKind:'c_locus',term:g.workflow.C(g.cGraphFunctionRef({graphFunctionRef:A.name,input:g.cCarrier(contract('recursive-state')),output:g.cCarrier(contract('recursive-state'))}))}],edges:[],applications:[]};
  d.graphFunctions=[root,A,parent];d.contributions=d.contributions.filter(c=>d.graphFunctions.some(f=>f.name===c.handle));
  d.implementationBindings=d.implementationBindings.filter(b=>[ref('binding','A'),ref('binding','parent')].includes(b.bindingRef)).map(b=>({...b,modulePath:'build/foldback.mjs'}));
  d.productSemanticsBinding.modulePath='build/foldback.mjs';d.evaluators=d.evaluators.filter(e=>e.name===ref('evaluator','parent'));d.rules=d.rules.filter(r=>r.name===ref('rule','parent'));
  d.programs[0].callableMembership=d.graphFunctions.map(f=>f.name);
  return d;
}
const foldbackFixtureSource=`
import {executeB as accepted,evaluateParent as evaluate,SEMANTICS as original,ref,contract,hash} from './recursive.mjs';
const declared=${JSON.stringify(declared)},undeclared=${JSON.stringify(undeclared)};
const counts=globalThis[Symbol.for('abi5.recursive-failure-foldback.invocations')]??=new Map();
const invocation=input=>{const n=(counts.get(input.taskDigest)??0)+1;counts.set(input.taskDigest,n);return n;};
const success=input=>{const c=accepted(input);return {...c,evidenceCandidates:c.evidenceCandidates.map(e=>({...e,implementationRef:ref('implementation','A')}))};};
const failure=(name,input,diagnosticRef)=>{const resultCandidate={kind:'selection_failure',schemaVersion:'5.0.0',failureClass:'controlled_child_failure',diagnosticRef};
 return {kind:'leaf_realization_candidate',schemaVersion:'5.0.0',disposition:'failure',resultCandidate,diagnosticRef,
 evidenceCandidates:[{kind:'deterministic_evidence_candidate',schemaVersion:'5.0.0',implementationRef:ref('implementation',name),inputDigest:hash(input),outputDigest:hash(resultCandidate)}]};};
export function executeA(input){
 const scenario=input.task.scenario,n=invocation(input);
 if(scenario==='success'||scenario==='fail-once'&&n>1)return success(input);
 return failure('A',input,scenario==='undeclared'||scenario==='handled-then-undeclared'&&n>1?undeclared:declared);
}
export function evaluateParent(input){return input.task.scenario==='parent-fails'?failure('parent',input,declared):evaluate(input);}
const descriptor=name=>{const body={implementationRef:ref('implementation',name),packageName:original.packageName,packageVersion:'5.0.0',modulePath:'build/foldback.mjs',namedSymbol:name==='A'?'executeA':'evaluateParent',computeRegime:'F_D',inputContractRef:contract('recursive-state'),outputContractRef:contract('recursive-state'),failureContractRef:contract('failure'),refusalContractRef:contract('refusal')};return {kind:'packaged_leaf_implementation_descriptor',schemaVersion:'5.0.0',...body,descriptorDigest:hash(body)};};
export const A_DESCRIPTOR=descriptor('A'),PARENT_DESCRIPTOR=descriptor('parent');
export const SEMANTICS={...original,resolveJudgmentRelation(predicateRef){
 if(predicateRef!==ref('predicate','A'))return original.resolveJudgmentRelation(predicateRef);
 return {predicateRef,advanceReasonRef:ref('reason','valid'),rejectionReasonRef:ref('reason','unresolved'),evaluate(input,output){return hash(output)===hash(success(input).resultCandidate);}};
}};
`;
const fixtureFiles=fixturePath=>[...['index','recursive'].map(n=>({path:'build/'+n+'.mjs',source:new URL('../fixtures/registered-selection-product/'+n+'.mjs',import.meta.url)})),{path:'build/foldback.mjs',source:fixturePath}];

// Each child frame that folded back failed: its frame probe scope (no C_Call,
// no actor) and its GraphCall.
function failedFolds(events){
  return events.filter(e=>e.kind==='child_foldback_admitted'&&e.payload.childDisposition==='failed').map(fold=>{
    const scopes=[...new Set(events.filter(e=>e.kind==='runtime_activity_probe_observed'&&e.payload.probeContract.scope.frameId===fold.payload.childFrameId&&
      e.payload.probeContract.scope.cCallRef===null&&e.payload.probeContract.scope.actorInvocationRef===null).map(e=>e.payload.observation.scopeDigest))];
    assert.equal(scopes.length,1,'one frame probe scope per folded child frame');
    return {fold,key:`runtime_invocation_active(${scopes[0]})`,frameId:fold.payload.childFrameId,graphCallId:fold.payload.childGraphCallId};
  });
}
const resultCoordinate=event=>({ref:event.payload.resultRef,digest:event.payload.resultDigest});
const originFields=event=>({result:resultCoordinate(event),cCallRef:event.aggregateId,graphFunctionRef:event.graphFunctionRef,contractRef:event.payload.contractRef,valueKind:event.payload.value.kind});

test('declared failure foldbacks read back by cause: the bound is the origin, the undeclared failure is named, and no ended frame reads live',{timeout:1_800_000},async t=>{
  const fixtureRoot=await mkdtemp(join(tmpdir(),'abi5-readable-stops-foldback-'));t.after(()=>rm(fixtureRoot,{force:true,recursive:true}));
  const fixturePath=join(fixtureRoot,'foldback.mjs');await writeFile(fixturePath,foldbackFixtureSource);
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>[await prepareRegisteredSelectionProduct({...basis,declarationFactory:foldbackDeclarations,fixtureFiles:fixtureFiles(fixturePath)})]});
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,['recursive-parent','root','A'].map(n=>ref('graph-function',n)));
  const parentRef=ref('graph-function','recursive-parent');
  const load=relative=>import(pathToFileURL(join(env.installedRoot,'build/code/src',relative+'.js')).href);
  const publicApi=await load('public/index'),storeOwner=await load('abg/event_store'),reads=await load('abg/project_read_ports');
  let handoff=env.store.projectReopenAuthorityAndClose();
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  // One Public start per scenario; the fixture's invocation counter is local to each CLI process.
  async function start(scenario){
    const input=initialState();input.task={...input.task,scenario};input.taskDigest=hash(input.task);
    const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length,identity='readable-foldback-'+scenario;
    const {call}=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity});
    const execution=await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null});
    const receipt=execution.output?.receipt;assert.ok(receipt?.resources?.run,JSON.stringify(execution.output).slice(0,4000));
    handoff=receipt.resources.eventResource.closeHandoff;
    return {owner:receipt.ownerOutput,line:JSON.stringify(execution.output),run:receipt.resources.run,events:storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).slice(before)};
  }
  // Cold reads: each member is one fresh CLI process reopening the closed resource.
  async function read(memberKey,source,identity){
    const selector=memberKey.endsWith('_replay')?{kind:'ordinal_page',fromOrdinal:0,limit:2048}:{kind:'none'};
    const {call}=constructInstalledRunReadCall({environment:env,publicApi,memberKey,selector,source,eventResource:resource(),identity});
    const output=(await runInstalledCliRequest({scratch:env.scratch,installedRoot:env.installedRoot,identity,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null})).output;
    const owner=output.receipt.ownerOutput;assert.equal(owner.outcomeKind,'result',JSON.stringify(owner).slice(0,4000));
    return owner.value.projection;
  }
  // The owner's source coordinate of each GraphCall, over a cold reopen.
  function graphCallSources(graphCallIds){
    const cold=env.abg.reopenEventStore(structuredClone(handoff.reopenAuthority));assert.equal(cold.kind,'reopened_event_store_context');
    try{return graphCallIds.map(id=>reads.prepareRunReadAtDurablePrefix(cold.prefix,'graph_call_replay',id).source);}
    finally{cold.store.projectReopenAuthorityAndClose();}
  }
  // R-7: no Public read presents a frame ended by a stopped foldback as live
  // or its GraphCall as closed. The derived fluent and the replay still hold it.
  async function assertEndedFrames(name,run,status){
    const folds=failedFolds(run.events),fluents=status.activeFluents.map(f=>f.ref),liveness=status.nativeLiveness?.invocations??[];
    const sources=graphCallSources(folds.map(fold=>fold.graphCallId));
    for(const [index,fold] of folds.entries()){
      assert.equal(fluents.includes(fold.key),false,'the ended frame probe is not presented active');
      assert.equal(liveness.some(i=>i.scope.frameId===fold.frameId&&i.scope.cCallRef===null&&i.scope.actorInvocationRef===null),false,'no ended frame invocation');
      const child=await read('graph_call_replay',sources[index],`${name}-child-${index}`);
      assert.deepEqual([child.status,child.terminalResult],['failed',null],'the folded child GraphCall reads failed, not closed');
    }
    return folds;
  }

  await t.test('a handled failure that later closes reads completed with no live ended frame',async()=>{
    const run=await start('fail-once');
    assert.deepEqual([run.owner.outcomeKind,run.owner.value.disposition],['result','completed']);
    assert.equal('stopStatement' in run.owner.value,false,'a completed start states no stop');
    assert.deepEqual(run.events.filter(e=>e.kind==='child_foldback_admitted'&&e.payload.applicationRef!==undefined).map(e=>e.payload.childDisposition),['failed','closed']);
    const status=await read('run_status',run.run,'fail-once-status'),replay=await read('run_replay',run.run,'fail-once-replay');
    assert.deepEqual([status.status,replay.status,status.stop],['closed','closed',undefined]);
    const folds=await assertEndedFrames('fail-once',run,status);assert.equal(folds.length,2);
  });

  await t.test('handled failures until the bound read the bound as the stop and its judged Result as the origin',async()=>{
    const run=await start('always-fail');
    assert.deepEqual([run.owner.outcomeKind,run.owner.value.disposition],['result','blocked']);
    const status=await read('run_status',run.run,'always-fail-status'),replay=await read('run_replay',run.run,'always-fail-replay'),stop=status.stop;
    assert.deepEqual([status.status,replay.status,replay.terminalResult],['blocked','blocked',null]);assert.deepEqual([stop.eventKind,stop.disposition,stop.reasonRef,stop.operator],['run_stopped','blocked',boundExhausted,null]);
    const parents=run.events.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===parentRef);
    assert.deepEqual(parents.map(e=>e.payload.resultClass),['success','success','success']);
    const failures=run.events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.resultClass==='failure');
    assert.ok(failures.length>=4,'each handled failure and its lift are admitted');
    // The bound judges the last parent Result; the handled failures before it are no origin.
    assert.deepEqual(stop.origin,{kind:'result',...originFields(parents.at(-1)),resultClass:'success'});
    for(const failure of failures)assert.equal(stop.statement.includes(failure.payload.resultRef),false,'no handled failure is named');
    assert.equal(stop.statement.includes('controlled_child_failure'),false);
    // R-1: the root's last Result is named by kind, reference and contract, its content uninterpreted.
    const last=parents.at(-1);
    assert.deepEqual(stop.lastRootResult,{kind:'admitted_result',result:resultCoordinate(last),contractRef:last.payload.contractRef,valueKind:'recursive_selection_state',
      valueDigest:product.sha256Canonical(last.payload.value),value:last.payload.value,cCallRef:last.aggregateId,resultAdmissionEventRef:last.eventId});
    assert.equal(stop.statement,`The Run stopped as blocked and did not complete. Reason: ${boundExhausted}. `+
      `Originating Result: recursive_selection_state ${last.payload.resultRef} from ${parentRef}. `+
      `The last admitted Result of the root GraphCall is recursive_selection_state ${last.payload.resultRef} under contract ${last.payload.contractRef}. No next lawful action is admitted.`);
    // R-5: the start output states the status read, from the same fold.
    assert.equal(run.owner.value.stopStatement,stop.statement);assert.ok(run.line.includes(JSON.stringify(stop.statement)));
    const folds=await assertEndedFrames('always-fail',run,status);assert.equal(folds.length,4);
  });

  await t.test('an undeclared child failure is still named as the origin through its lift',async()=>{
    const run=await start('undeclared');
    assert.deepEqual([run.owner.outcomeKind,run.owner.value.disposition],['result','runtime_failed']);
    const status=await read('run_status',run.run,'undeclared-status'),stop=status.stop;
    const origin=run.events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.failureClass==='controlled_child_failure');
    assert.equal(origin.length,1);
    assert.deepEqual([status.status,stop.eventKind,stop.reasonRef,stop.stage],['failed','runtime_failure_observed',undeclared,'route']);
    assert.deepEqual(stop.origin,{kind:'failure',...originFields(origin[0]),failureClass:'controlled_child_failure',diagnosticRef:undeclared,timeout:{kind:'not_admitted'}});
    assert.equal(run.owner.value.stopStatement,stop.statement);
    assert.ok(stop.statement.includes(`Originating failure: class controlled_child_failure in ${origin[0].payload.resultRef} from ${ref('graph-function','A')}; timeout class not admitted.`),stop.statement);
  });

  // The first child failure is handled: folded back, consumed by the advance
  // route of its own parent C-call, and the parent re-evaluated. The next child
  // then fails with an undeclared class and the Run fails. The origin is that
  // later failure; the handled one is named nowhere. The prior positional rule
  // (descent by parentCCallRef from the stopping C-call) reads the same origin
  // here, because re-evaluation opens a new C-call and no later stop's route or
  // descent passes through the C-call that consumed the handled foldback. This
  // case is a regression guard, not a discriminator between the two rules.
  await t.test('a handled failure followed by an undeclared failure of the next child reads the later failure as the origin',async()=>{
    const run=await start('handled-then-undeclared');
    assert.deepEqual([run.owner.outcomeKind,run.owner.value.disposition],['result','runtime_failed']);
    const status=await read('run_status',run.run,'handled-then-undeclared-status'),stop=status.stop;
    const failuresOfA=run.events.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===ref('graph-function','A')&&e.payload.resultClass==='failure');
    assert.deepEqual(failuresOfA.map(e=>e.payload.value.diagnosticRef),[declared,undeclared]);
    const [handled,later]=failuresOfA;
    assert.deepEqual(run.events.filter(e=>e.kind==='child_foldback_admitted'&&e.payload.applicationRef!==undefined).map(e=>e.payload.childDisposition),['failed'],'the handled failure folds back to the parent');
    assert.deepEqual(run.events.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===parentRef).map(e=>e.payload.resultClass),['success','success'],'the parent is re-evaluated');
    assert.deepEqual([status.status,stop.eventKind,stop.reasonRef,stop.stage],['failed','runtime_failure_observed',undeclared,'route']);
    assert.deepEqual(stop.origin,{kind:'failure',...originFields(later),failureClass:'controlled_child_failure',diagnosticRef:undeclared,timeout:{kind:'not_admitted'}});
    assert.equal(stop.statement.includes(handled.payload.resultRef),false,'the handled failure is not named');
    assert.ok(stop.statement.includes(`Originating failure: class controlled_child_failure in ${later.payload.resultRef} from ${ref('graph-function','A')}; timeout class not admitted.`),stop.statement);
    assert.equal(run.owner.value.stopStatement,stop.statement);
  });
});
